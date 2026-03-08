import json
import os
import asyncio
from aiokafka import AIOKafkaProducer

# Default to localhost for local testing, Docker will override this via env vars
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

class KafkaClient:
    def __init__(self):
        self.producer = None

    async def start(self):
        max_retries = 5
        retry_delay = 5
        
        for attempt in range(max_retries):
            try:
                print(f"Attempting to connect to Kafka (Attempt {attempt + 1}/{max_retries})...")
                self.producer = AIOKafkaProducer(
                    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                    value_serializer=lambda v: json.dumps(v).encode('utf-8')
                )
                await self.producer.start()
                print(f"Connected to Kafka broker at {KAFKA_BOOTSTRAP_SERVERS}")
                return 
                
            except Exception as e:
                print(f"Kafka not ready: {e}. Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
          
        raise ConnectionError("Failed to connect to Kafka after multiple attempts.")

    async def stop(self):
        if self.producer:
            await self.producer.stop()
            print("Disconnected from Kafka broker")

    async def send_event(self, topic: str, event_data: dict):
        # Prevent silent fails if called before start() or after a connection crash
        if not self.producer:
            raise RuntimeError("Kafka producer is not initialized.")
            
        await self.producer.send_and_wait(topic, event_data)

# Singleton instance for the FastAPI app
kafka_client = KafkaClient()