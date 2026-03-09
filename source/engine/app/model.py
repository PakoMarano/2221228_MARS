from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class RuleCreate(BaseModel):
    # Allow both snake_case and camelCase inputs, serialize using API aliases.
    model_config = ConfigDict(populate_by_name=True)

    sensor_id: str = Field(alias="sensorId")
    operator: str
    # Stored as TEXT because some sensors (e.g. airlock) send string values like "IDLE" instead of numbers
    threshold_value: str = Field(alias="threshold")
    unit: str
    actuator_target: str = Field(alias="actuator")
    actuator_state: str = Field(alias="setTo")
    active: bool = Field(default=True, alias="status")


class RuleUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    sensor_id: Optional[str] = Field(default=None, alias="sensorId")
    operator: Optional[str] = None
    threshold_value: Optional[str] = Field(default=None, alias="threshold")
    unit: Optional[str] = None
    actuator_target: Optional[str] = Field(default=None, alias="actuator")
    actuator_state: Optional[str] = Field(default=None, alias="setTo")
    active: Optional[bool] = Field(default=None, alias="status")


class RuleResponse(RuleCreate):
    id: int


class RuleStatusUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    active: bool = Field(alias="status")


class ActuatorCommand(BaseModel):
    state: str | bool