# CONTAINERS:

## CONTAINER_NAME: simulator

### DESCRIPTION: 
Externally provided IoT simulator that simulates the sensors and life support systems of a Martian habitat (e.g., solar arrays, greenhouse temperature, oxygen levels). It exposes WebSocket endpoints and REST sensors to read data and REST APIs to send commands to the actuators.

### PORTS: 
8080:8080 (HTTP/WS)

### PERSISTENCE EVALUATION
No long-term persistence. The simulator generates data on the fly.

### EXTERNAL SERVICES CONNECTIONS
It does not connect to external services, but acts as a data source for the ingestion-service and receives commands from the automation-engine.

### MICROSERVICES:

#### MICROSERVICE: iot-simulator
- TYPE: backend (external tool)
- DESCRIPTION: IoT telemetry generator and simulated actuators manager.
- PORTS: 8080
- TECHNOLOGICAL SPECIFICATION:
Pre-built container.

- ENDPOINTS:

| HTTP METHOD | URL | Description | User Stories |
| ----------- | --- | ----------- | ------------ |
| GET | `/api/sensors` | List available sensors for polling | 1, 2, 6 |
| GET | `/api/sensors/{sensor_id}` | Return sensor values | 1, 2, 6, 7 |
| GET | `/api/telemetry/topics` | List telemetry topics | 1, 6, 7 |
| WS | `/api/telemetry/ws?topic={topic}` | Live telemetry stream | 1, 6, 15 |
| GET | `/api/actuators` | Current actuator states | 3 |
| POST | `/api/actuators/{actuator_name}` | Set actuator state | 4, 12, 15 |

## CONTAINER_NAME: kafka

### DESCRIPTION: 
Apache Kafka messaging broker running in KRaft mode , single node. It acts as the backbone for the asynchronous communication of the entire system, allowing real-time event ingestion, distribution, and processing between ingestion, automation, and presentation services in a completely decoupled manner.

### USER STORIES:
1, 4, 6, 8, 15

### PORTS: 
9092:9092 (Internal Docker Network Listeners)
29092:29092 (External Host Listeners for Debugging)

### EXTERNAL SERVICES CONNECTIONS
Receives data streams (writes) from the ingestion-service. Provides data streams (reads) to the presentation-service and automation-engine-worker.

### MICROSERVICES:

#### MICROSERVICE: kafka-broker
- TYPE: backend
- DESCRIPTION: Message Broker for managing publisher/subscriber event queues.
- PORTS: 9092, 29092
- TECHNOLOGICAL SPECIFICATION:
Apache Kafka configured in single-node KRaft.
- SERVICE ARCHITECTURE: 
Manages two main topics created at launch via the kafka-init helper container: internal-telemetry (for normalized sensor data) and actuator-events (for the history of sent commands).

#### MICROSERVICE: kafka-init
- TYPE: backend
- DESCRIPTION: Bash script to initialize kafka topics.
- SERVICE ARCHITECTURE: 
Creates the topics needed for the kafka broker so that the services find all ready to exchange data.

## CONTAINER_NAME: ingestion

### DESCRIPTION: 
Microservice responsible for extracting raw data from the IoT simulator. It listens to the various WebSocket channels exposed by the simulator, extracts useful values from complex JSON payloads, formats them into a standardized schema (normalization), and publishes them to the Kafka broker on the internal-telemetry topic.

### USER STORIES:
2. As a user, I want to see when each sensor last reported data, so that I can detect devices that may be offline or malfunctioning.

### PORTS: 
8000:8000

### PERSISTENCE EVALUATION
Totally stateless. It does not save any data to disk. It processes data streams in memory and forwards them immediately to Kafka.

### EXTERNAL SERVICES CONNECTIONS
Connects to the simulator in http://simulator:8080 both with websockets and REST calls. Publishes events to kafka:9092.

### MICROSERVICES:

#### MICROSERVICE: ingestion-service
- TYPE: backend
- DESCRIPTION: Data normalizer and Kafka Publisher.
- PORTS: 8000
- TECHNOLOGICAL SPECIFICATION:
Developed in Python using FastAPI for the base structure and websockets + aiokafka for asynchronous I/O management of network streams.
- SERVICE ARCHITECTURE: 
Event-driven. At startup (lifespan event), it generates multiple concurrent asynchronous tasks. Each task is dedicated to listening to a specific sensor on the simulator for streams , another task for all REST sensors, normalizes the payload into a standard event message, and sends it into Kafka.


## CONTAINER_NAME: automation-engine

### DESCRIPTION: 
The logical heart of the system. Divided into two containers. The API exposes REST routes to allow the frontend to create, read, update, or delete (CRUD) automation rules. The Worker is a background daemon that consumes telemetry from Kafka, evaluates real-time data against rules saved in the database, and, if conditions are met, sends HTTP commands to the simulator's actuators, logging the action on Kafka.

### USER STORIES:
3, 4, 8, 9, 10, 11, 12, 13, 14, 15

### PORTS: 
8001:8000 (exposed by automation-engine-api)

### PERSISTENCE EVALUATION
Uses a shared Docker volume (engine-db-volume) mapped to /code/app/ to save the SQLite database file. User-configured rules persist even if containers are restarted or updated.

### EXTERNAL SERVICES CONNECTIONS
The Worker reads from kafka:9092 (topic: internal-telemetry), publishes to kafka:9092 (topic: actuator-events), and sends HTTP POST requests to http://simulator:8080/api/actuators. The automation Engine API exposes API endpoints to save , update , remove and get actuator rules from the frontend.

### MICROSERVICES:

#### MICROSERVICE: automation-engine-api
- TYPE: backend
- DESCRIPTION: REST API for managing the automation rules database.
- PORTS: 8000 (Internal) / 8001 (Published)
- TECHNOLOGICAL SPECIFICATION:
Python, FastAPI, SQLite3.
- SERVICE ARCHITECTURE: 
Standard RESTful architecture with controllers ,Pydantic schemas for input validation and interaction with the local sql database.

- ENDPOINTS:
		
	| HTTP METHOD | URL | Description | User Stories |
	| GET | /api/rules | Returns the list of all automation rules | 9, 15 |
    | POST | /api/rules | Creates a new rule for an actuator | 10 |
	| PATCH | /api/rules/{rule_id} | Updates specific fields of an existing automation rule in the database | 11 |
	| PATCH | /api/rules/{rule_id}/status | Toggles the active/inactive state of a specific automation rule | 14 |
	| DELETE | /api/rules/{rule_id} | Deletes an existing automation rule from the database | 12 |
	| POST | /api/actuators/{actuator_name} | Sends a manual override command to a specific actuator on the simulator and publishes the event to Kafka | 13  |
	| GET | /api/actuators | Fetches the current state of all actuators from the simulator and normalizes the response for the frontend | 3 |

- DB STRUCTURE: table "rules":

	rules : | id | sensor_id | operator | threshold_value | unit | actuator_target | actuator_state | active 

#### MICROSERVICE: automation-engine-worker
- TYPE: backend (background task)
- DESCRIPTION: Real-time event evaluation engine. Runs `python -m app.worker`; no public HTTP interface.
- PORTS: None
- TECHNOLOGICAL SPECIFICATION:
Python, aiokafka , sqlite3.
- SERVICE ARCHITECTURE: 
Pure Kafka consumer. Loops infinitely on new messages, queries the rules DB, evaluates logical expressions, and triggers HTTP calls (side-effects) if thresholds are breached.

- DB STRUCTURE: table "rules":

	rules : | id | sensor_id | operator | threshold_value | unit | actuator_target | actuator_state | active 


## CONTAINER_NAME: presentation-service

### DESCRIPTION: 
Backend dedicated exclusively to the Frontend. Acts as a "WebSocket Bridge". It consumes normalized messages arriving from Kafka (both telemetry and actuator events), adapts them to the exact JSON schema required by the user interface (UI), and broadcasts them (push) in real-time to all connected browsers.

### USER STORIES:
1, 4, 6, 8, 15

### PORTS: 
4000:4000

### PERSISTENCE EVALUATION
Totally stateless. Does not keep any history. When a user connects, they only receive data generated from the moment of connection onwards (Kafka consumer set with auto_offset_reset="latest").

### EXTERNAL SERVICES CONNECTIONS
Listens to kafka:9092 (topics: internal-telemetry). Exposes incoming connections on ws://localhost:4000/ for browsers.

### MICROSERVICES:

#### MICROSERVICE: presentation-service
- TYPE: backend
- DESCRIPTION: WebSocket Gateway for real-time data streaming to the client.
- PORTS: 4000
- TECHNOLOGICAL SPECIFICATION:
Python, FastAPI, websockets, aiokafka.
- SERVICE ARCHITECTURE: 
Uses a Singleton pattern for the ConnectionManager to track active clients. A background task (Lifespan event) extracts messages from Kafka and triggers the asynchronous broadcast method on all open sockets.

- ENDPOINTS:
		
	| HTTP METHOD | URL | Description | User Stories |
	| GET(WS) | / | WebSocket endpoint for frontend connection and bidirectional streaming | 1, 4, 6, 8, 15 |


## CONTAINER_NAME: frontend

### DESCRIPTION: 
React single-page application for monitoring sensors/topics, visualizing charts, managing rules, and controlling actuators.

### USER STORIES:
1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15

### PORTS: 
3000:3000

### PERSISTENCE EVALUATION
The container only serves static files and handles proxying. No backend persistence; client-side in-memory store only (state resets on refresh). Only persists saved actuators rule.

### EXTERNAL SERVICES CONNECTIONS
During development, it connects via Webpack internal proxy to http://automation-engine-api:8000 (for REST APIs) and establishes a direct connection from the browser to ws://localhost:4000/ws (presentation-service).

### MICROSERVICES:

#### MICROSERVICE: frontend
- TYPE: frontend
- DESCRIPTION: RealTime Martian Survival Kit Dashboard.
- PORTS: 3000
- TECHNOLOGICAL SPECIFICATION:
React.js, Webpack, Babel.
- SERVICE ARCHITECTURE: 
Component-based architecture. Uses Context API or local State Management to handle the data flow arriving from WebSockets and selectively update sensor cards to minimize re-renders. Includes logic to bypass CORS issues in a Docker environment.

- PAGES:

| Name | Description | Related Microservice | User Stories |
| ---- | ----------- | -------------------- | ------------ |
| Dashboard | Summary cards for sensors, telemetry topics, and actuators with live updates | ingestion-service, automation-engine-api, automation-engine-worker, presentation-service | 1, 2, 3, 4, 12, 15 |
| Sensors | Filterable sensor charts by habitat area and measurement type with metric switching | ingestion-service, presentation-service | 5, 6, 7 |
| Telemetry | Filterable topic charts by type and criticality with metric switching | ingestion-service, presentation-service | 5, 6, 7 |
| Controls | Rule table, create/edit/delete, status toggle, and last-triggered visibility | automation-engine-api, automation-engine-worker, presentation-service | 8, 9, 10, 11, 13, 14, 15 |

