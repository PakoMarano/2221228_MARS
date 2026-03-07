from typing import Optional

from pydantic import BaseModel


class RuleCreate(BaseModel):
    sensor_id: str
    operator: str
    # Stored as TEXT because some sensors (e.g. airlock) send string values like "IDLE" instead of numbers
    threshold_value: str
    actuator_target: str
    actuator_state: str
    active: bool = True


class RuleUpdate(BaseModel):
    sensor_id: Optional[str] = None
    operator: Optional[str] = None
    threshold_value: Optional[str] = None
    actuator_target: Optional[str] = None
    actuator_state: Optional[str] = None
    active: Optional[bool] = None


class RuleResponse(RuleCreate):
    id: int
