import { useEffect } from "react";
import { useStore } from "../store/store";
import { addSensorValue } from "../store/slices/sensorsSlice";
import { addTopicValue } from "../store/slices/topicsSlice";
import { setActuator } from "../store/slices/actuatorsSlice";

const WS_URL = "ws://localhost:4000";

export const useWebSocketService = () => {
    const { dispatch } = useStore();

    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => console.log("WebSocket connected");
        ws.onclose = () => console.log("WebSocket disconnected");

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const { category, key, value } = data;

                switch (category) {
                    case "sensor":
                        dispatch(addSensorValue(key, value));
                        break;
                    case "topic":
                        dispatch(addTopicValue(key, value));
                        break;
                    case "actuator":
                        dispatch(setActuator(key, value));
                        break;
                    default:
                        break;
                }
            } catch (err) {
                console.error("Invalid WS message:", event.data);
            }
        };

        return () => ws.close();
    }, [dispatch]);
};