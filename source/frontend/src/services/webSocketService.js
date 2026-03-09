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

                const { device_type, device_id, metric, value, unit, status, timestamp } = data;

                switch (device_type) {

                    case "sensor":
                        dispatch(addSensorValue({
                            key: device_id,
                            metric,
                            value,
                            unit,
                            status,
                            timestamp
                        }));
                        break;

                    case "topic":
                        let key = data.device_id ?? data.key;
                        if (typeof key === "string" && key.startsWith("mars/telemetry/")) {
                            key = key.replace("mars/telemetry/", "");
                        }
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
                        dispatch(setActuator(device_id, value));
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