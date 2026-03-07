import asyncio
import aiohttp
import os
from app.normalizer import normalize_rest_payload
from app.kafka_client import kafka_client, TOPIC_TELEMETRY

# Read the simulator URL from environment variables, fallback to localhost for local testing
SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://localhost:8080")
POLL_INTERVAL_SECONDS = 30

async def fetch_sensor_data(session: aiohttp.ClientSession, sensor_id: str):
    """Makes a GET request to a specific sensor endpoint to get its current state."""
    url = f"{SIMULATOR_URL}/api/sensors/{sensor_id}"
    try:
        async with session.get(url) as response:
            if response.status == 200:
                # Return the raw JSON dictionary exactly as the simulator sends it
                return await response.json()
            else:
                print(f"⚠️ Warning: Sensor {sensor_id} returned HTTP status {response.status}")
                return None
    except Exception as e:
        print(f"❌ Error fetching {sensor_id}: {e}")
        return None

async def start_polling():
    """Background task that runs forever, polling the APIs and printing raw data."""
    print(f"🚀 Starting REST API Poller. Target: {SIMULATOR_URL}")
    
    async with aiohttp.ClientSession() as session:
        while True:
            try:
                # 1. Fetch the list of available REST sensors
                async with session.get(f"{SIMULATOR_URL}/api/sensors") as response:
                    if response.status != 200:
                        print(f"❌ Could not reach {SIMULATOR_URL}/api/sensors endpoint.")
                        await asyncio.sleep(POLL_INTERVAL_SECONDS)
                        continue
                    
                    # Read the JSON payload
                    payload = await response.json()
                    
                    # Extract the list from the "sensors" key if it's a dictionary
                    if isinstance(payload, dict):
                        sensor_list = payload.get("sensors", [])
                    else:
                        sensor_list = payload # Fallback just in case it's already a list
                    
                print(f"🔍 Found {len(sensor_list)} sensors. Fetching data...")
                
                # 2. Iterate through each sensor and poll its current value
                for sensor_id in sensor_list:
                    raw_data = await fetch_sensor_data(session, sensor_id)
                    
                    if raw_data:
                        #print(f"📥 RAW DATA [{sensor_id}]: {raw_data}")
                        normalized_events = normalize_rest_payload(sensor_id, raw_data)
                        for event in normalized_events:
                            # Pydantic model_dump_json() converts it directly to a JSON string, 
                            # but our KafkaClient expects a dict to serialize it, so we use model_dump()
                            payload = event.model_dump()
                            payload['timestamp'] = payload['timestamp'].isoformat() # Ensure date is string
                            

                            #print(f"⏳ Sto per inviare a Kafka [{sensor_id}] -> {event.metric}...")
                            await kafka_client.send_event(TOPIC_TELEMETRY, payload)
                            #print(f"✅ INVIATO CON SUCCESSO: {event.metric} = {event.value}")
                print(f"Data sent with Kafka...")

            except Exception as e:
                print(f"🚨 Poller encountered an error: {e}")
            
            print("-" * 60)
            await asyncio.sleep(POLL_INTERVAL_SECONDS)