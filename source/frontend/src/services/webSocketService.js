import { useEffect } from "react";
import { useStore } from "../store/store";
import { addSensorValue } from "../store/slices/sensorsSlice";
import { addTopicValue } from "../store/slices/topicsSlice";
import { setActuator } from "../store/slices/actuatorsSlice";
import { updateRule } from "../store/slices/rulesSlice";

const WS_URL = `${process.env.WS_PROTOCOL}://${process.env.WS_HOST}:${process.env.WS_PORT}`;

export const useWebSocketService = () => {
    const { dispatch } = useStore();

    useEffect(() => {
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => console.log("WebSocket connected");
        ws.onclose = () => console.log("WebSocket disconnected");

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                const { category, key, metric, value, unit, status, timestamp } = data;

                switch (category) {

                    case "sensor":
                        dispatch(addSensorValue({
                            key,
                            metric,
                            value,
                            unit,
                            status,
                            timestamp
                        }));
                        break;

                    case "topic":
                        dispatch(addTopicValue({
                            key,
                            metric,
                            value,
                            unit,
                            status,
                            timestamp
                        }));
                        break;

                    case "actuator":
                        dispatch(setActuator(key, value));
                        const triggeredRuleId = Number(metric);
                        if (!isNaN(triggeredRuleId)) {
                            dispatch(updateRule(triggeredRuleId, { lastTriggered: timestamp }));
                        }
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