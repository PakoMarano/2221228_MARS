from pydantic import BaseModel, Field
from datetime import datetime
from typing import Union, Optional

class NormalizedEvent(BaseModel):
    """
    Standard Internal Event Format.
    This model represents the unified schema for all ingested data,
    satisfying requirement 5.1 (Device ingestion and normalization).
    """
    # Unique identifier of the device (e.g., "greenhouse_temperature")
    device_id: str = Field(..., description="The unique ID of the sensor or device")
    
    # Type of the device (e.g., "sensor", "actuator")
    device_type: str = Field(..., description="Category of the device")
    
    # Pydantic will automatically parse ISO 8601 strings into datetime objects
    # e.g., "2026-03-06T12:00:00Z"
    timestamp: datetime = Field(..., description="When the reading was recorded")
    
    # Operational status (e.g., "ok", "error", "warning")
    status: str = Field(..., description="Current operational status of the device")
    
    # The physical property being measured (e.g., "temperature", "humidity", "co2")
    metric: str = Field(..., description="The name of the measured metric")
    
    # Using float allows for both integer and decimal numbers
    value: Union[float, str] = Field(..., description="The value of the reading")
    
    # Unit of measurement (e.g., "°C", "%", "ppm")
    unit: Optional[str] = Field(default=None, description="The physical unit of the measurement")

    class Config:
        # This provides a sample payload that FastAPI uses to automatically 
        # generate Swagger UI documentation (accessible at /docs)
        json_schema_extra = {
            "example": {
                "device_id": "greenhouse_temperature",
                "device_type": "sensor",
                "timestamp": "2026-03-06T12:00:00Z",
                "status": "ok",
                "metric": "temperature",
                "value": 28.5,
                "unit": "°C"
            }
        }