import { SENSORS } from "../../constants/enums/sensors";

/* ---------------- STATO INIZIALE ---------------- */
export const initialSensorsState = {
    values: Object.values(SENSORS).reduce((acc, sensor) => {
        acc[sensor.key] = [];
        return acc;
    }, {})
};

/* ---------------- AZIONI ---------------- */
export const SENSORS_ACTIONS = {
    ADD_VALUE: "SENSORS_ADD_VALUE",
    ADD_BATCH: "SENSORS_ADD_BATCH"
};

/* Action creator per aggiungere un singolo valore */
export const addSensorValue = (key, value, timestamp) => ({
    type: SENSORS_ACTIONS.ADD_VALUE,
    payload: { key, value, timestamp }
});

/* Action creator per aggiungere un batch di valori */
export const addSensorsBatch = (data) => ({
    type: SENSORS_ACTIONS.ADD_BATCH,
    payload: data
});

/* ---------------- REDUCER ---------------- */

const MAX_HISTORY = 500; // Limite storico per ciascun sensore

export const sensorsReducer = (state, action) => {
    switch (action.type) {

        case SENSORS_ACTIONS.ADD_VALUE: {
            const { key, value, timestamp } = action.payload;

            return {
                ...state,
                values: {
                    ...state.values,
                    [key]: [
                        ...state.values[key],
                        { value, timestamp: timestamp ?? Date.now() }
                    ].slice(-MAX_HISTORY) // mantiene solo ultimi MAX_HISTORY valori
                }
            };
        }

        case SENSORS_ACTIONS.ADD_BATCH: {
            const updates = action.payload;
            const newValues = { ...state.values };

            Object.entries(updates).forEach(([key, value]) => {
                if (!newValues[key]) newValues[key] = [];
                newValues[key] = [
                    ...newValues[key],
                    { value, timestamp: Date.now() }
                ].slice(-MAX_HISTORY);
            });

            return {
                ...state,
                values: newValues
            };
        }

        default:
            return state;
    }
};

/* ---------------- SELECTOR UTILI ---------------- */

/* Prende l’ultimo valore di un sensore */
export const getLastSensorValue = (state, key) => {
    const arr = state.values[key];
    return arr.length > 0 ? arr[arr.length - 1] : null;
};

/* Media degli ultimi N valori di un sensore */
export const getSensorAverage = (state, key, n = 10) => {
    const arr = state.values[key];
    if (!arr.length) return null;
    const slice = arr.slice(-n);
    const sum = slice.reduce((acc, curr) => acc + curr.value, 0);
    return sum / slice.length;
};

/* Trend: differenza tra ultimo e penultimo valore */
export const getSensorTrend = (state, key) => {
    const arr = state.values[key];
    if (arr.length < 2) return null;
    return arr[arr.length - 1].value - arr[arr.length - 2].value;
};