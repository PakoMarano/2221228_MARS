import { useCallback } from "react";
import { useStore } from "../store/store";
import { setActuator, setActuatorsBatch } from "../store/slices/actuatorsSlice";
import { getActuatorsState, setActuatorState } from "../services/actuatorsService";

export const useActuators = () => {
    const { dispatch } = useStore();

    const setAllActuators = useCallback((data) => {
        dispatch(setActuatorsBatch(data));
    }, [dispatch]);

    const updateActuator = useCallback(async (key, value) => {
        dispatch(setActuator(key, value));

        try {
            await setActuatorState(key, value);
        } catch (err) {
            console.error(`Failed to set actuator "${key}" state:`, err);
            dispatch(setActuator(key, !value));
        }
    }, [dispatch]);

    const fetchActuators = useCallback(async () => {
        try {
            const response = await getActuatorsState();
            dispatch(setActuatorsBatch(response.data));
        } catch (err) {
            console.error("Failed to fetch actuators state:", err);
        }
    }, [dispatch]);

    return {
        setAllActuators,
        updateActuator,
        fetchActuators
    };
};