from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Keeps track of all open browser tabs connected to our WebSocket
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"New WS client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WS Client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Loop through all connected clients and send the JSON payload
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Failed to send message to a client: {e}")
                # We don't remove the connection here, the disconnect() method 
                # will be triggered automatically by FastAPI's exception handler

manager = ConnectionManager()