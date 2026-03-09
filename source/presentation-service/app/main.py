import asyncio
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager

from app.ws_manager import manager
from app.kafka_listener import EventConsumer

TOPICS = ["internal-telemetry", "actuator-events"]
consumer = EventConsumer(TOPICS)

async def consume_and_broadcast():
    # Background task that bridges Kafka and WebSockets without blocking the main thread.
    try:
        async for msg in consumer.get_messages():
            topic = msg.get("topic")
            payload = msg.get("payload", {})
            
            formatted_msg = None
            #print(f"Received message on topic '{topic}': {payload}")
            
            # Translates backend events into the schema required by the frontend
            if topic == "actuator-events":
                formatted_msg = {
                    "category": "actuator",
                    "key": payload.get("actuator", "unknown"),
                    "metric": str(payload.get("rule_id", "")), # Frontend uses 'metric' to display the Rule ID
                    "unit": "state",
                    "value": 1 if payload.get("state") == "ON" else 0, # Frontend JSON schema enforces 'value' as a number
                    "status": "ok",
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                }
            elif topic == "internal-telemetry":
                raw_value = payload.get("value")
                # 2. Tentiamo una conversione sicura
                try:
                    final_value = float(raw_value)
                except (ValueError, TypeError):
                    final_value = raw_value
                
                formatted_msg = {
                    "category": "sensor",
                    "key": payload.get("device_id", payload.get("key", "unknown")),
                    "metric": payload.get("metric", "level"),
                    "unit": payload.get("unit", ""),
                    "value": final_value,
                    "status": payload.get("status", "ok"),
                    "timestamp": payload.get("timestamp", datetime.utcnow().isoformat() + "Z")
                }
            
            if formatted_msg:
                print(f"📢 Broadcasting a {len(manager.active_connections)} client connessi: {formatted_msg}")
                await manager.broadcast(formatted_msg)
                
    except asyncio.CancelledError:
        print("Kafka consumer task cancelled during shutdown.")
    except Exception as e:
        print(f"Error in consumer loop: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    await consumer.start()
    
    # Fire-and-forget task so the event loop is free to handle new WS connections
    task = asyncio.create_task(consume_and_broadcast())
    
    yield
    
    task.cancel()
    await consumer.stop()

app = FastAPI(lifespan=lifespan)

@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages FROM the frontend, just keeping the socket alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)