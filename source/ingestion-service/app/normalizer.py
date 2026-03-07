from datetime import datetime, timezone
from app.models import NormalizedEvent

def normalize_rest_payload(sensor_id: str, raw_data: dict) -> list[NormalizedEvent]:
    """
    Converts a REST sensor payload into a list of NormalizedEvents.
    Usually, REST sensors return a single metric.
    """
    events = []
    
    # Try to extract standard fields, fallback to current time/ok if missing
    timestamp = raw_data.get("captured_at", datetime.now(timezone.utc))
    status = raw_data.get("status")

    if "measurements" in raw_data and isinstance(raw_data["measurements"], list):
        # Loop through every object inside the array
        for item in raw_data["measurements"]:
            metric = item.get("metric")
            value = item.get("value")
            unit = item.get("unit")
            
            if value is not None:
                event = NormalizedEvent(
                    device_id=sensor_id,
                    device_type="rest_sensor",
                    timestamp=timestamp,
                    status=status,
                    metric=metric,
                    value=value,
                    unit=unit
                )
                events.append(event)
    elif "pm1_ug_m3" in raw_data or "pm25" in sensor_id:
        json_key = ["pm1_ug_m3", "pm25_ug_m3", "pm10_ug_m3"]
        for key in json_key:
            value = raw_data.get(key)
            if value is not None:
                event = NormalizedEvent(
                    device_id=sensor_id,
                    device_type="rest_sensor",
                    timestamp=timestamp,
                    status=status,
                    metric=key,
                    value=value,
                    unit="µg/m³"
                )
                events.append(event)
    elif "level_liters" in raw_data or "water_tank_level" in sensor_id:
        json_key = ["level_liters"]
        for key in json_key:
            value = raw_data.get(key)
            if value is not None:
                event = NormalizedEvent(
                    device_id=sensor_id,
                    device_type="rest_sensor",
                    timestamp=timestamp,
                    status=status,
                    metric=key,
                    value=value,
                    unit="liters"
                )
                events.append(event)
    else:
        value = raw_data.get("value")
        unit = raw_data.get("unit")
        metric = raw_data.get("metric")
        
        if value is not None:
            event = NormalizedEvent(
                device_id=sensor_id,
                device_type="rest_sensor",
                timestamp=timestamp,
                status=status,
                metric=metric,
                value=value,
                unit=unit
            )
            events.append(event)
        
    return events

def normalize_telemetry_payload(topic: str, raw_data: dict) -> list[NormalizedEvent]:
    """
    Converts WebSocket telemetry payloads into a list of NormalizedEvents.
    Flattens multi-metric payloads into individual standard events.
    """
    events = []
    
    # 1. Extract common fields
    # If the simulator doesn't send the time, we fallback to current UTC time
    timestamp_str = raw_data.get("event_time")
    timestamp = timestamp_str if timestamp_str else datetime.now(timezone.utc)
    
    # Not all schemas have 'status' (e.g., power and airlock don't), fallback to "ok"
    status = raw_data.get("status", "")
    
    # We use the explicit topic from the JSON, or fallback to the one passed by WebSocket
    actual_topic = raw_data.get("topic", topic)

    # ---------------------------------------------------------
    # SCHEMA 1: Power (solar_array, power_bus, power_consumption)
    # ---------------------------------------------------------
    if "power" in actual_topic or "solar_array" in actual_topic:
        device_id = raw_data.get("subsystem", actual_topic)
        
        # Map intuitive metric names to their JSON keys and units
        metrics_to_extract = {
            "power": {"key": "power_kw", "unit": "kW"},
            "voltage": {"key": "voltage_v", "unit": "V"},
            "current": {"key": "current_a", "unit": "A"},
            "energy": {"key": "cumulative_kwh", "unit": "kWh"}
        }
        
        for metric_name,info in metrics_to_extract.items():
            val = raw_data.get(info["key"])
            if val is not None:
                events.append(NormalizedEvent(
                    device_id=device_id,
                    device_type="telemetry_stream",
                    timestamp=timestamp,
                    status=status,
                    metric=info["key"],
                    value=val,
                    unit=info["unit"]
                ))

    # ---------------------------------------------------------
    # SCHEMA 2: Environment (radiation, life_support)
    # ---------------------------------------------------------
    elif "radiation" in actual_topic or "life_support" in actual_topic:
        # device_id is nested inside source -> system
        source = raw_data.get("source")
        system = source.get("system")
        segment = source.get("segment")
        device_id = f"{segment}/{system}"
        
        measurements = raw_data.get("measurements", [])
        for meas in measurements:
            val = meas.get("value")
            metric = meas.get("metric")
            unit = meas.get("unit")
            if val is not None:
                events.append(NormalizedEvent(
                    device_id=device_id,
                    device_type="telemetry_stream",
                    timestamp=timestamp,
                    status=status,
                    metric=metric,
                    value=val,
                    unit=unit
                ))

    # ---------------------------------------------------------
    # SCHEMA 3: Thermal Loop (thermal_loop)
    # ---------------------------------------------------------
    elif "thermal_loop" in actual_topic:
        loop = raw_data.get("loop")
        device_id = f"{actual_topic}/{loop}"
        
        metrics_to_extract = {
            "temperature": {"key": "temperature_c", "unit": "C"},
            "flow": {"key": "flow_l_min", "unit": "L/min"}
        }
        
        for metric_name,info in metrics_to_extract.items():
            val = raw_data.get(info["key"])
            if val is not None:
                events.append(NormalizedEvent(
                    device_id=device_id,
                    device_type="telemetry_stream",
                    timestamp=timestamp,
                    status=status,
                    metric=info["key"],
                    value=val,
                    unit=info["unit"]
                ))

    # ---------------------------------------------------------
    # SCHEMA 4: Airlock (airlock)
    # ---------------------------------------------------------
    elif "airlock" in actual_topic:
        airlock_id = raw_data.get("airlock_id")
        device_id = f"{actual_topic}/{airlock_id}"
        
        # Metric 1: Cycles per hour (Number)
        cycles = raw_data.get("cycles_per_hour")
        if cycles is not None:
            events.append(NormalizedEvent(
                device_id=device_id,
                device_type="telemetry_stream",
                timestamp=timestamp,
                status=status,
                metric="cycles_per_hour",
                value=cycles,
                unit="cycles/h"
            ))
            
        # Metric 2: State (String)
        state = raw_data.get("last_state")
        if state is not None:
            events.append(NormalizedEvent(
                device_id=device_id,
                device_type="telemetry_stream",
                timestamp=timestamp,
                status=status,
                metric="last_state",
                value=state, 
                unit=None    # States don't have units
            ))

    return events