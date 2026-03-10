import operator

# Map string operators to actual Python math functions
OPERATORS = {
    "=": operator.eq,
    "==": operator.eq,
    "!=": operator.ne,
    ">": operator.gt,
    "<": operator.lt,
    ">=": operator.ge,
    "<=": operator.le
}

AIRLOCK_V1_SENSOR_ID = "airlock/airlock-1"

AIRLOCK_CODE_TO_STATE = {
    "0": "DEPRESSURIZING",
    "1": "IDLE",
    "2": "PRESSURIZING",
}


def _normalize_airlock_state(value):
    """
    Normalizes airlock state values to canonical string labels.
    Accepts labels ("IDLE") and mapped numeric codes ("1"/1).
    Returns the original value when no airlock mapping applies.
    """
    if isinstance(value, str):
        normalized = value.strip().upper()
        if normalized in AIRLOCK_CODE_TO_STATE.values():
            return normalized
        if normalized in AIRLOCK_CODE_TO_STATE:
            return AIRLOCK_CODE_TO_STATE[normalized]
        return value

    if isinstance(value, (int, float)):
        if isinstance(value, float) and not value.is_integer():
            return value
        as_code = str(int(value))
        if as_code in AIRLOCK_CODE_TO_STATE:
            return AIRLOCK_CODE_TO_STATE[as_code]

    return value

def evaluate_rule(rule: dict, telemetry: dict) -> bool:
    """
    Evaluates a single rule against a single telemetry event.
    Returns True if the actuator should be triggered, False otherwise.
    """
    clean_device_id = telemetry["device_id"].removeprefix("mars/telemetry/")
    # 1. Check if the rule even applies to this sensor
    if rule["sensor_id"] != clean_device_id:
        return False

    # 1b. If a rule is bound to a specific unit, only evaluate matching telemetry units.
    rule_unit = str(rule.get("unit", "")).strip()
    telemetry_unit = str(telemetry.get("unit", "")).strip()
    if rule_unit and rule_unit.casefold() != telemetry_unit.casefold():
        return False
        
    # 2. Get the actual operator function
    op_str = rule["operator"]
    if op_str not in OPERATORS:
        print(f"Warning: Unknown operator '{op_str}' in rule {rule['id']}")
        return False
    
    compare_func = OPERATORS[op_str]
    
    # 3. Handle type casting safely
    sensor_value = telemetry["value"]
    threshold_value = rule["threshold_value"]

    # Airlock v1 states are compared as canonical labels, even if threshold is saved as 0/1/2.
    if clean_device_id == AIRLOCK_V1_SENSOR_ID:
        sensor_value = _normalize_airlock_state(sensor_value)
        threshold_value = _normalize_airlock_state(threshold_value)

    # Only equality checks are meaningful for string states (e.g., "IDLE" vs "RUNNING").
    if isinstance(sensor_value, str) and op_str not in {"=", "==", "!="}:
        return False
    
    # If the sensor gave us a number, we must convert the DB string to a float before comparing
    if isinstance(sensor_value, (int, float)):
        try:
            threshold_value = float(threshold_value)
        except ValueError:
            print(f"Error: Rule {rule['id']} threshold '{threshold_value}' cannot be compared to numeric sensor value.")
            return False
    
    # 4. Do the math
    return compare_func(sensor_value, threshold_value)