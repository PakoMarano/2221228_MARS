import asyncio
import time
import sqlite3
import httpx
import os

from app.kafka_client.kafka_consumer import EventConsumer
from app.kafka_client.kafka_producer import kafka_client
from app.evaluator import evaluate_rule

TOPIC_NORMALIZED = "internal-telemetry"
TOPIC_ACTUATORS = "actuator-events"
SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://localhost:8080")
DB_FILE = "app/rules.db"
REFRESH_INTERVAL_SEC = 10

def fetch_active_rules():
    # Synchronous call is acceptable here since local SQLite reads are typically < 1ms,
    # avoiding the overhead of introducing an async DB driver.
    conn = sqlite3.connect(DB_FILE, timeout=5.0)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM rules WHERE active = 1")
    rules = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rules

async def run_worker():
    print("Starting Automation Engine Worker...")
    
    consumer = EventConsumer(TOPIC_NORMALIZED)
    await consumer.start()
    await kafka_client.start()
    
    rules_cache = fetch_active_rules()
    last_refresh = time.time()
    print(f"Loaded {len(rules_cache)} active rules.")

    # Reusing a single HTTP client session for performance
    async with httpx.AsyncClient() as http_client:
        print("Listening for telemetry...")
        
        async for telemetry in consumer.get_messages():
            current_time = time.time()
            if current_time - last_refresh > REFRESH_INTERVAL_SEC:
                rules_cache = fetch_active_rules()
                last_refresh = current_time
                print(f"[Cache Refresh] Loaded {len(rules_cache)} rules.")

            for rule in rules_cache:
                if evaluate_rule(rule, telemetry):
                    target = rule["actuator_target"]
                    state = rule["actuator_state"]
                    print(f"RULE TRIGGERED (ID {rule['id']}): Setting {target} to {state}")
                    
                    try:
                        # 1. Fire command to the simulator
                        response = await http_client.post(
                            f"{SIMULATOR_URL}/api/actuators/{target}",
                            json={"state": state},
                            timeout=3.0
                        )
                        response.raise_for_status()
                        
                        # 2. Broadcast the state change so the UI can update
                        await kafka_client.send_event(TOPIC_ACTUATORS, {"actuator": target, "state": state, "rule_id": rule['id']})
                        
                    except httpx.RequestError as e:
                        print(f"Failed to reach simulator for rule {rule['id']}: {e}")
                    except httpx.HTTPStatusError as e:
                        print(f"Simulator rejected command for rule {rule['id']}: {e.response.status_code}")

if __name__ == "__main__":
    asyncio.run(run_worker())