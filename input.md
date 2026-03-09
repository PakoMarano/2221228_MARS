# SYSTEM DESCRIPTION:
Martian Survival Kit is a distributed automation platform capable of ingesting heterogeneous sensor data, normalizing it into a unified internal representation, evaluating simple automation rules, and providing a real-time dashboard for habitat monitoring.


# USER STORIES:
1. As a user, I want a dashboard that updates sensor values in real time, so that I can continuously monitor habitat conditions.

2. As a user, I want to see when each sensor last reported data, so that I can detect devices that may be offline or malfunctioning.

3. As a user, I want to see the current state of each actuator, so that I know which systems are active.

4. As a user, I want the dashboard to update actuator states in real time when rules are triggered, so that I can see actions immediately.

5. As a user, I want to filter widgets by sensor type or location, so that I can focus on specific areas of the habitat.

6. As a user, I want to see charts of sensor data that update automatically, so that I can track trends over time.

7. As a user, I want to choose which measurement to display for sensors that provide multiple types of data, so that I can focus on the information that is most useful to me.

8. As a user, I want widgets to display alerts when sensor values exceed thresholds, so that I can respond immediately to critical conditions.

9. As a user, I want to view all automation rules in a dashboard, so that I can understand which conditions trigger which actuators.

10. As a user, I want to create new automation rules via the dashboard, so that I can add new behaviors without modifying code.

11. As a user, I want to edit existing automation rules, so that I can adjust thresholds, operators, or actuator targets.

12. As a user, I want to delete outdated or unnecessary automation rules, so that only relevant rules are executed.

13. As a user, I want toggle widgets for actuators, so that I can turn devices on or off directly from the dashboard.

14. As a user, I want to modify existing automation rules so that I can temporarily disable them when needed.

15. As a user, I want to see the last time each automation rule was triggered, so that I can verify the automation engine is working correctly.


# STANDARD EVENT SCHEMA:
- `device_id: string`
	Unique identifier of the source device (example: `greenhouse_temperature`).
- `device_type: string`
	Type of device producing the event (example: `sensor`, `actuator`).
- `timestamp: string`
	UTC event time (example: `2026-03-06T12:00:00Z`).
- `status: string`
	Ingestion/health status for the event (example: `ok`, `warning`).
- `metric: string`
	Measurement name reported by the device (example: `temperature`, `humidity`).
- `value: string`
	Normalized value payload; supports both numeric readings and symbolic states.
- `unit: string`
	Unit for numeric metrics when applicable (example: `C`, `%`, `ppm`).


# RULE MODEL:
- `sensor_id: string`
	Sensor identifier used in the condition (example: `temp_1`).
- `operator: string`
	Comparison operator used to evaluate the rule (example: `>`, `<`, `==`).
- `threshold_value: string`
	Value to compare against. Stored as string to support both numeric and symbolic sensor values.
- `unit: string`
	Unit associated with the selected sensor/topic metric for threshold comparison (example: `C`, `%`, `ppm`).
- `actuator_target: string`
	Target actuator name to control when the rule condition is true.
- `actuator_state: string`
	State/command sent to the actuator when triggered (`ON`, `OFF`).
- `active: boolean` (default: `true`)
	Enables or disables rule execution without deleting the rule.
- `id: integer` (response only)
	Unique identifier assigned by the backend when a rule is created.