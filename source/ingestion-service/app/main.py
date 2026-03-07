import asyncio
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.kafka_client import kafka_client
from app.poller import start_polling
from app.telemetry import start_streaming

# Background task references
poller_task = None
streamer_task = None 

@asynccontextmanager
async def lifespan(app: FastAPI):
    global poller_task, streamer_task
    print("--- 🟢 INGESTION SERVICE STARTING ---")
    
    await kafka_client.start()
    
    # Start both background tasks concurrently
    poller_task = asyncio.create_task(start_polling())
    streamer_task = asyncio.create_task(start_streaming()) 
    
    yield 
    
    print("--- 🔴 INGESTION SERVICE SHUTTING DOWN ---")
    
    # Cancel background tasks cleanly
    if poller_task:
        poller_task.cancel()
    if streamer_task:
        streamer_task.cancel() 
        
    await kafka_client.stop()

app = FastAPI(title="Mars IoT Ingestion Service", lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ingestion-service"}