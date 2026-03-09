import json
import os
import asyncio
from typing import Iterable, Union
import uuid
from aiokafka import AIOKafkaConsumer

KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")

class EventConsumer:
    def __init__(self, topics: Union[str, Iterable[str]]):
        if isinstance(topics, str):
            normalized_topics = [topics]
        else:
            normalized_topics = [topic for topic in topics if topic]

        if not normalized_topics:
            raise ValueError("At least one topic must be provided.")

        self.topics = normalized_topics
        self.consumer = None

    async def start(self):
        max_retries = 5
        retry_delay = 5
        
        for attempt in range(max_retries):
            try:
                print(f"Attempting to connect Kafka Consumer (Attempt {attempt + 1}/{max_retries})...")
                self.consumer = AIOKafkaConsumer(
                    *self.topics,
                    bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                    group_id=f"presentation-{uuid.uuid4()}", # Generates a random group_id on startup so every Presentation instance receives ALL messages
                    auto_offset_reset="latest" # Ignores historical data on startup to avoid firing actuators for past telemetry states.
                )
                await self.consumer.start()
                print(f"Consumer connected to topics {self.topics} at {KAFKA_BOOTSTRAP_SERVERS}")
                return
            except Exception as e:
                print(f"Kafka not ready: {e}. Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
        
        raise ConnectionError("Failed to connect Kafka Consumer after multiple attempts.")

    async def stop(self):
        if self.consumer:
            await self.consumer.stop()
            print("Kafka Consumer disconnected.")

    async def get_messages(self):
        # Yields messages asynchronously as they arrive
        if not self.consumer:
            raise RuntimeError("Consumer is not initialized.")
        
        async for msg in self.consumer:
            # Wraps the payload with its origin topic so the frontend can route it properly
            yield {
                "topic": msg.topic,
                "payload": msg.value
            }