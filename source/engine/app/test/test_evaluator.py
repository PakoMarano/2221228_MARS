from app.evaluator import evaluate_rule

# Mock rules mimicking SQLite rows
rule_temp = {
    "id": 1,
    "sensor_id": "greenhouse_temperature",
    "operator": ">",
    "threshold_value": "25.0",
    "unit": "C",
    "actuator_target": "cooling_fan",
    "actuator_state": "ON"
}

rule_airlock = {
    "id": 2,
    "sensor_id": "main_airlock",
    "operator": "==",
    "threshold_value": "PRESSURIZING",
    "unit": "state",
    "actuator_target": "inner_door",
    "actuator_state": "LOCKED"
}

# Mock telemetry mimicking Kafka events
telemetry_hot = {
    "device_id": "greenhouse_temperature",
    "value": 30.5,
    "unit": "C"
}

telemetry_cold = {
    "device_id": "greenhouse_temperature",
    "value": 20.0,
    "unit": "C"
}

telemetry_hot_f = {
    "device_id": "greenhouse_temperature",
    "value": 30.5,
    "unit": "F"
}

telemetry_airlock = {
    "device_id": "main_airlock",
    "value": "PRESSURIZING",
    "unit": "state"
}

# Run the tests
print("--- Running Evaluator Tests ---")
print("Test 1 (Hot Temp > 25):    ", evaluate_rule(rule_temp, telemetry_hot))    # Expected: True
print("Test 2 (Cold Temp > 25):   ", evaluate_rule(rule_temp, telemetry_cold))   # Expected: False
print("Test 3 (Airlock Match):    ", evaluate_rule(rule_airlock, telemetry_airlock)) # Expected: True
print("Test 4 (Wrong Sensor):     ", evaluate_rule(rule_temp, telemetry_airlock)) # Expected: False
print("Test 5 (Wrong Unit):       ", evaluate_rule(rule_temp, telemetry_hot_f)) # Expected: False
print("-------------------------------")