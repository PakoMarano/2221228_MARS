import asyncio
import aiohttp
import websockets
import json
import os
from app.normalizer import normalize_telemetry_payload
from app.kafka_client import kafka_client, TOPIC_TELEMETRY

# Base URLs
SIMULATOR_URL = os.getenv("SIMULATOR_URL", "http://simulator:8080")
# Convert http:// to ws:// for WebSocket connections
SIMULATOR_WS_URL = SIMULATOR_URL.replace("http", "ws").replace("https", "wss")

async def fetch_topics() -> list:
    """Fetches the list of available telemetry topics from the REST API."""
    async with aiohttp.ClientSession() as session:
        try:
            url = f"{SIMULATOR_URL}/api/telemetry/topics"
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    # Handle both dictionary {"topics": [...]} and raw list [...] formats safely
                    if isinstance(data, dict):
                        return data.get("topics", [])
                    return data
                else:
                    print(f"❌ Failed to fetch topics, status: {response.status}")
        except Exception as e:
            print(f"❌ Error fetching telemetry topics: {e}")
    return []

async def listen_to_topic(topic: str):
    """Connects to a specific WebSocket topic and listens for messages."""
    ws_url = f"{SIMULATOR_WS_URL}/api/telemetry/ws?topic={topic}"
    print(f"🔌 Connecting to WS: {topic}")
    
    try:
        # Open the WebSocket connection
        async with websockets.connect(ws_url) as websocket:
            messages_received = 0
            
            # Keep listening forever
            while True:
                message = await websocket.recv()
                raw_data = json.loads(message)
                messages_received += 1

                normalized_events = normalize_telemetry_payload(topic, raw_data)

                for event in normalized_events:
                    payload = event.model_dump()
                    payload['timestamp'] = payload['timestamp'].isoformat()
                    
                    await kafka_client.send_event(TOPIC_TELEMETRY, payload)
                    # Uncomment below if you want to see every message being sent
                    # print(f"📤 KAFKA (WS) [{topic} -> {event.metric}]: {event.value}")
                
    except websockets.exceptions.ConnectionClosed:
        print(f"⚠️ WS Connection closed for {topic}")
    except Exception as e:
        print(f"❌ WS Error on {topic}: {e}")

async def start_streaming():
    """Main entry point for the streamer background task."""
    print(f"🚀 Starting Telemetry Streamer...")
    
    # 1. Get all available topics dynamically
    topics = await fetch_topics()
    
    if not topics:
        print("⚠️ No telemetry topics found. Streamer stopping.")
        return

    print(f"🔍 Found {len(topics)} telemetry topics. Booting up listeners...")
    
    # 2. Create an independent background task for EACH topic
    tasks = [asyncio.create_task(listen_to_topic(topic)) for topic in topics]
    
    # 3. Wait for all tasks to run concurrently (this runs forever)
    await asyncio.gather(*tasks)