import json
import os
import asyncio # <-- Add this import
from aiokafka import AIOKafkaProducer

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
TOPIC_TELEMETRY = "internal-telemetry"

class KafkaClient:
    def __init__(self):
        self.producer = None

    async def start(self):
        """Connects to the Kafka broker with a retry mechanism."""
        max_retries = 5
        retry_delay = 5  # seconds
        
        for attempt in range(max_retries):
            try:
                print(f"🔄 Attempting to connect to Kafka (Attempt {attempt + 1}/{max_retries})...")
                self.producer = AIOKafkaProducer(
                    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                    value_serializer=lambda v: json.dumps(v).encode('utf-8')
                )
                await self.producer.start()
                print(f"✅ Connected to Kafka broker at {KAFKA_BOOTSTRAP_SERVERS}")
                return # Exit the function successfully
                
            except Exception as e:
                print(f"⏳ Kafka not ready yet: {e}. Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
                
        print("❌ Failed to connect to Kafka after multiple attempts.")

    async def stop(self):
        """Disconnects cleanly from the Kafka broker."""
        if self.producer:
            await self.producer.stop()
            print("🛑 Disconnected from Kafka broker")

    async def send_event(self, topic: str, event_data: dict):
        """Sends data to a specific topic."""
        if self.producer:
            await self.producer.send_and_wait(topic, event_data)

# Singleton instance
kafka_client = KafkaClient()