from contextlib import asynccontextmanager
import os

import httpx
from fastapi import FastAPI, HTTPException
from typing import List

from app.database import get_db_connection, init_db
from app.model import RuleCreate, RuleResponse, RuleUpdate, RuleStatusUpdate, ActuatorCommand
from app.kafka_client.kafka_producer import kafka_client

SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://localhost:8080")
TOPIC_ACTUATORS = os.getenv("TOPIC_ACTUATORS", "actuator-events")


def normalize_actuator_state(state: str | bool) -> str:
    if isinstance(state, bool):
        return "ON" if state else "OFF"

    normalized = state.strip().upper()
    if normalized == "TRUE":
        return "ON"
    if normalized == "FALSE":
        return "OFF"
    return normalized

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    await kafka_client.start()
    yield
    await kafka_client.stop()

app = FastAPI(lifespan=lifespan)

# Note: We intentionally do not validate or prevent logically conflicting rules 
# (e.g., Rule A turns fan ON, Rule B turns fan OFF for the same threshold).
# Building a conflict-resolution or priority graph is out of scope.
# Resolving logical contradictions is delegated to the dashboard user.
@app.post("/api/rules", response_model=RuleResponse)
async def create_rule(rule: RuleCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO rules (sensor_id, operator, threshold_value, actuator_target, actuator_state, active)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (rule.sensor_id, rule.operator, rule.threshold_value, rule.actuator_target, rule.actuator_state, int(rule.active)))
    
    rule_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {**rule.model_dump(), "id": rule_id}

@app.get("/api/rules", response_model=List[RuleResponse])
async def get_rules():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rules")
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]


@app.patch("/api/rules/{rule_id}", response_model=RuleResponse)
async def update_rule(rule_id: int, rule_update: RuleUpdate):
    updates = rule_update.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    if "active" in updates:
        updates["active"] = int(updates["active"])

    set_clause = ", ".join(f"{field} = ?" for field in updates.keys())
    values = list(updates.values())
    values.append(rule_id)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(f"UPDATE rules SET {set_clause} WHERE id = ?", values)
    conn.commit()

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Rule not found")

    cursor.execute("SELECT * FROM rules WHERE id = ?", (rule_id,))
    updated_row = cursor.fetchone()
    conn.close()

    return dict(updated_row)


@app.patch("/api/rules/{rule_id}/status", response_model=RuleResponse)
async def update_rule_status(rule_id: int, status_update: RuleStatusUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE rules SET active = ? WHERE id = ?", (int(status_update.active), rule_id))
    conn.commit()

    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Rule not found")

    cursor.execute("SELECT * FROM rules WHERE id = ?", (rule_id,))
    updated_row = cursor.fetchone()
    conn.close()

    return dict(updated_row)

@app.delete("/api/rules/{rule_id}")
async def delete_rule(rule_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM rules WHERE id = ?", (rule_id,))
    conn.commit()
    deleted = cursor.rowcount
    conn.close()
    
    if deleted == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    return {"status": "success", "deleted_id": rule_id}

@app.post("/api/actuators/{actuator_name}")
async def manual_actuator_override(actuator_name: str, command: ActuatorCommand):
    async with httpx.AsyncClient() as client:
        try:
            normalized_state = normalize_actuator_state(command.state)

            # Forward the exact payload format the simulator expects
            response = await client.post(
                f"{SIMULATOR_URL}/api/actuators/{actuator_name}",
                json={"state": normalized_state},
                timeout=3.0
            )
            response.raise_for_status()
            
            # If simulator accepts the command, broadcast the state change to Kafka
            event_payload = {"actuator": actuator_name, "state": normalized_state}
            await kafka_client.send_event(TOPIC_ACTUATORS, event_payload)
            
            return {"status": "success", "actuator": actuator_name, "state": normalized_state}
        
        except httpx.RequestError:
            # Prevent the engine from crashing if the simulator container is offline
            raise HTTPException(status_code=503, detail="Simulator is unreachable")
        except httpx.HTTPStatusError as e:
            # Forward 400/404/500 errors from the simulator back to the frontend
            raise HTTPException(status_code=e.response.status_code, detail="Simulator rejected the command")
        
# WHY NO GET ENDPOINT?
# The physical simulator is write-only and lacks actuators state feedback.