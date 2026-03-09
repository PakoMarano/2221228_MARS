# SYSTEM DESCRIPTION:

Martian Survival Kit is a distributed microservice platform for Mars habitat automation. It ingests heterogeneous data from simulator REST sensors and telemetry WebSocket topics, normalizes all events into a shared internal schema, publishes them to Kafka, evaluates configurable automation rules, and streams live updates to a web dashboard.

Core data flow:
1. Ingestion service acquires REST and telemetry data from the simulator.
2. Events are normalized to a standard schema and published to Kafka topic `internal-telemetry`.
3. Automation engine worker consumes telemetry, evaluates active rules, commands actuators, and emits `actuator-events`.
4. Presentation service consumes Kafka topics and pushes real-time updates to frontend clients via WebSocket.
5. Frontend provides monitoring, filtering, charting, actuator controls, and rule management.

# USER STORIES:

Implemented user stories:
1. Real-time dashboard updates for sensor values.
2. Sensor "last reported" timestamp visibility.
3. Current actuator state visibility.
4. Real-time actuator updates when rules are triggered.
5. Widget filtering by type/location (sensors) and by type/criticality (topics).
6. Auto-updating sensor/topic charts.
7. Metric selection for multi-measurement sensors/topics.
8. View all automation rules in a dashboard table.
9. Create automation rules from dashboard.
10. Edit automation rules.
11. Delete automation rules.
12. Toggle actuators directly from dashboard widgets.
13. Enable/disable rules without deleting them.
14. Show last trigger time for rules (frontend state updated from actuator events).
15. Real-time rule-triggered events via WebSocket.



# CONTAINERS:

## CONTAINER_NAME: simulator

### DESCRIPTION:
IoT simulator container (external prebuilt image) providing synthetic sensor endpoints, telemetry streams, and actuator endpoints used by platform services.

### USER STORIES:
Indirectly supports all data-driven stories by acting as data/actuator source, especially 1, 2, 3, 4, 6, 12, 15.

### PORTS:
`8080:8080`

### DESCRIPTION:
Provides:
- REST sensor APIs consumed by ingestion poller.
- WebSocket telemetry topics consumed by ingestion streamer.
- Actuator command APIs used by automation engine API and worker.

### PERSISTENCE EVALUATION
No persistent data configured in this project for simulator container.

### EXTERNAL SERVICES CONNECTIONS
Exposed to:
- Ingestion service (`http://simulator:8080`)
- Automation engine API/worker (`http://simulator:8080`)

### MICROSERVICES:

#### MICROSERVICE: simulator-api
- TYPE: backend
- DESCRIPTION: External simulator service (not implemented in this repository source code).
- PORTS: `8080`
- TECHNOLOGICAL SPECIFICATION:
Prebuilt Docker image `mars-iot-simulator:multiarch_v1`.
- SERVICE ARCHITECTURE:
Standalone external provider used by ingestion and automation services.

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
Kafka broker (KRaft mode, single node) used as event backbone between ingestion, automation, and presentation services.

### USER STORIES:
Enables asynchronous real-time event distribution supporting 1, 4, 6, 14, 15.

### PORTS:
`9092:9092` (internal), `29092:29092` (external host access)

### DESCRIPTION:
Handles topics:
- `internal-telemetry` (normalized sensor/topic events)
- `actuator-events` (manual/rule-triggered actuator changes)

### PERSISTENCE EVALUATION
Broker state is internal to Kafka container; no explicit host volume is defined in compose for long-term persistence.

### EXTERNAL SERVICES CONNECTIONS
Connected clients:
- ingestion-service producer
- automation-engine-worker consumer + producer
- automation-engine-api producer (manual actuator override)
- presentation-service consumer

### MICROSERVICES:

#### MICROSERVICE: kafka-broker
- TYPE: backend
- DESCRIPTION: Messaging infrastructure service.
- PORTS: `9092`, `29092`, `9093` (controller)
- TECHNOLOGICAL SPECIFICATION:
Docker image `apache/kafka:latest`, KRaft single-node setup.
- SERVICE ARCHITECTURE:
Central publish/subscribe event bus for decoupled microservice communication.

## CONTAINER_NAME: kafka-init

### DESCRIPTION:
One-shot initialization container that waits for Kafka and creates required topics.

### USER STORIES:
Bootstrapping support for all stories depending on event pipeline (1, 4, 6, 15).

### PORTS:
None exposed.

### DESCRIPTION:
Executes shell script to create `internal-telemetry` and `actuator-events` if missing.

### PERSISTENCE EVALUATION
No persisted data; ephemeral setup task.

### EXTERNAL SERVICES CONNECTIONS
Connects to Kafka bootstrap server `kafka:9092`.

### MICROSERVICES:

#### MICROSERVICE: kafka-topic-init
- TYPE: backend
- DESCRIPTION: Infrastructure bootstrap job.
- PORTS: none
- TECHNOLOGICAL SPECIFICATION:
Docker image `apache/kafka:latest` using `kafka-topics.sh`.
- SERVICE ARCHITECTURE:
Transient init process; exits after topics are created.

## CONTAINER_NAME: ingestion-service

### DESCRIPTION:
FastAPI ingestion backend that polls simulator REST sensors and listens to simulator telemetry streams, normalizes both formats, and publishes standard events to Kafka.

### USER STORIES:
1, 2, 5, 6, 7, 15 (through real-time normalized feed generation).

### PORTS:
`8000:8000`

### DESCRIPTION:
Runs two background tasks:
- REST poller (`poller.py`)
- Telemetry streamer (`telemetry.py`)

### PERSISTENCE EVALUATION
No local database; stateless event-processing service.

### EXTERNAL SERVICES CONNECTIONS
- Reads simulator REST/WS endpoints (`SIMULATOR_URL`)
- Publishes to Kafka (`KAFKA_BOOTSTRAP_SERVERS`)

### MICROSERVICES:

#### MICROSERVICE: ingestion-api
- TYPE: backend
- DESCRIPTION: Service lifecycle/health endpoint plus background ingestion workers.
- PORTS: `8000`
- TECHNOLOGICAL SPECIFICATION:
Python, FastAPI, aiohttp, websockets, aiokafka, Pydantic.
- SERVICE ARCHITECTURE:
Event-driven ingestion with normalization layer (`normalizer.py`) and Kafka producer (`kafka_client.py`).

- ENDPOINTS:

| HTTP METHOD | URL | Description | User Stories |
| ----------- | --- | ----------- | ------------ |
| GET | `/health` | Liveness probe for ingestion service | - |

## CONTAINER_NAME: automation-engine-api

### DESCRIPTION:
FastAPI backend for rule CRUD, rule status toggling, and manual actuator overrides.

### USER STORIES:
3, 8, 9, 10, 11, 12, 13, 14, 15.

### PORTS:
`8001:8000`

### DESCRIPTION:
Initializes SQLite rules database at startup and exposes REST APIs used by frontend.

### PERSISTENCE EVALUATION
Persistent rule storage in SQLite file `app/rules.db`, shared via named volume `engine-db-volume`.

### EXTERNAL SERVICES CONNECTIONS
- Simulator actuator APIs (HTTP via `SIMULATOR_URL`)
- Kafka producer for actuator events
- Shared DB volume with automation worker

### MICROSERVICES:

#### MICROSERVICE: automation-engine-rest
- TYPE: backend
- DESCRIPTION: Rule management and manual actuator command API.
- PORTS: `8000` (inside container), exposed as `8001` on host.
- TECHNOLOGICAL SPECIFICATION:
Python, FastAPI, sqlite3, httpx, aiokafka, Pydantic.
- SERVICE ARCHITECTURE:
Layered API: route handlers in `main.py`, DB access in `database.py`, schema models in `model.py`.

- ENDPOINTS:

| HTTP METHOD | URL | Description | User Stories |
| ----------- | --- | ----------- | ------------ |
| POST | `/api/rules` | Create a new automation rule | 9 |
| GET | `/api/rules` | List all rules | 8 |
| PATCH | `/api/rules/{rule_id}` | Update rule fields | 10 |
| PATCH | `/api/rules/{rule_id}/status` | Enable/disable a rule | 13 |
| DELETE | `/api/rules/{rule_id}` | Delete a rule | 11 |
| POST | `/api/actuators/{actuator_name}` | Manual actuator command and event publish | 12, 15 |
| GET | `/api/actuators` | Get current actuator states | 3 |

- DB STRUCTURE:

**_rules_** : | **_id_** | sensor_id | operator | threshold_value | actuator_target | actuator_state | active

## CONTAINER_NAME: automation-engine-worker

### DESCRIPTION:
Background worker that consumes normalized telemetry from Kafka, evaluates active rules, triggers simulator actuators, and emits actuator events.

### USER STORIES:
4, 14, 15.

### PORTS:
No ports exposed.

### DESCRIPTION:
Runs `python -m app.worker`; no public HTTP interface.

### PERSISTENCE EVALUATION
Reads active rules from shared SQLite (`app/rules.db`) through same volume as API container.

### EXTERNAL SERVICES CONNECTIONS
- Consumes Kafka topic `internal-telemetry`
- Produces Kafka topic `actuator-events`
- Calls simulator actuator endpoints

### MICROSERVICES:

#### MICROSERVICE: automation-rule-worker
- TYPE: backend
- DESCRIPTION: Rule evaluation engine loop.
- PORTS: none
- TECHNOLOGICAL SPECIFICATION:
Python asyncio, sqlite3, httpx, aiokafka.
- SERVICE ARCHITECTURE:
Cached active-rule polling from SQLite (refresh every 10s) plus per-event evaluation (`evaluator.py`).

## CONTAINER_NAME: presentation-service

### DESCRIPTION:
FastAPI WebSocket gateway that consumes Kafka events and pushes frontend-ready real-time messages to connected clients.

### USER STORIES:
1, 4, 6, 14, 15.

### PORTS:
`4000:4000`

### DESCRIPTION:
Bridges backend event stream to browser WebSocket clients.

### PERSISTENCE EVALUATION
No database; stateless real-time fan-out service.

### EXTERNAL SERVICES CONNECTIONS
- Consumes Kafka topics `internal-telemetry, actuator-events`
- Serves WebSocket endpoint for frontend (`ws://localhost:4000/`)

### MICROSERVICES:

#### MICROSERVICE: presentation-ws-gateway
- TYPE: backend
- DESCRIPTION: Kafka-to-WebSocket bridge.
- PORTS: `4000`
- TECHNOLOGICAL SPECIFICATION:
Python, FastAPI WebSocket, aiokafka.
- SERVICE ARCHITECTURE:
Background Kafka consumer task plus connection manager (`ws_manager.py`) broadcasting JSON events.

- ENDPOINTS:

| HTTP METHOD | URL | Description | User Stories |
| ----------- | --- | ----------- | ------------ |
| WS | `/` | Real-time event stream to dashboard clients | 1, 4, 6, 14, 15 |

## CONTAINER_NAME: frontend

### DESCRIPTION:
React single-page application for monitoring sensors/topics, visualizing charts, managing rules, and controlling actuators.

### USER STORIES:
1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15.

### PORTS:
`3000:3000`

### DESCRIPTION:
Webpack dev server with API proxy to automation-engine API and WebSocket client to presentation-service.

### PERSISTENCE EVALUATION
No backend persistence; client-side in-memory store only (state resets on refresh).

### EXTERNAL SERVICES CONNECTIONS
- REST calls via `/api` proxy to automation-engine API
- WebSocket connection to presentation-service (`WS_*` env variables)

### MICROSERVICES:

#### MICROSERVICE: mars-dashboard-ui
- TYPE: frontend
- DESCRIPTION: Dashboard and control UI.
- PORTS: `3000`
- TECHNOLOGICAL SPECIFICATION:
React, custom store/reducers, Webpack, Axios, WebSocket API.
- SERVICE ARCHITECTURE:
Component/page structure with service hooks (`useRules`, `useActuators`, `useWebSocketService`) and state slices for sensors/topics/actuators/rules.

- PAGES:

| Name | Description | Related Microservice | User Stories |
| ---- | ----------- | -------------------- | ------------ |
| Dashboard | Summary cards for sensors, telemetry topics, and actuators with live updates | ingestion-service, automation-engine-api, automation-engine-worker, presentation-service | 1, 2, 3, 4, 12, 15 |
| Sensors | Filterable sensor charts by habitat area and measurement type with metric switching | ingestion-service, presentation-service | 5, 6, 7 |
| Telemetry | Filterable topic charts by type and criticality with metric switching | ingestion-service, presentation-service | 5, 6, 7 |
| Controls | Rule table, create/edit/delete, status toggle, and last-triggered visibility | automation-engine-api, automation-engine-worker, presentation-service | 8, 9, 10, 11, 13, 14, 15 |

