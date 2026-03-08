import { SENSORS } from "../../constants/enums/sensors";

/* ---------------- STATO INIZIALE ---------------- */
export const initialSensorsState = {
    values: Object.values(SENSORS).reduce((acc, sensor) => {
        acc[sensor.key] = {};
        return acc;
    }, {})
};

/* ---------------- AZIONI ---------------- */
export const SENSORS_ACTIONS = {
    ADD_VALUE: "SENSORS_ADD_VALUE",
    ADD_BATCH: "SENSORS_ADD_BATCH"
};

/* Action creator per aggiungere un singolo valore */
export const addSensorValue = (data) => ({
    type: SENSORS_ACTIONS.ADD_VALUE,
    payload: data
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

            const { key, metric, value, unit, status, timestamp } = action.payload;

            const sensorMetrics = state.values[key] ?? {};
            const history = sensorMetrics[metric] ?? [];

            const newHistory = [
                ...history,
                {
                    value,
                    timestamp: timestamp ?? Date.now(),
                    unit,
                    status
                }
            ].slice(-MAX_HISTORY);

            return {
                ...state,
                values: {
                    ...state.values,
                    [key]: {
                        ...sensorMetrics,
                        [metric]: newHistory
                    }
                }
            };
        }

        default:
            return state;
    }
};

/* ---------------- SELECTOR UTILI ---------------- */

/* Prende l’ultimo valore di un sensore */
export const getLastSensorValue = (state, key, metric) => {
    const arr = state.values[key]?.[metric];
    return arr?.length ? arr[arr.length - 1] : null;
};

/* Media degli ultimi N valori di un sensore */
export const getSensorAverage = (state, key, metric, n = 10) => {
    const arr = state.values[key]?.[metric];
    if (!arr?.length) return null;

    const slice = arr.slice(-n);
    const sum = slice.reduce((acc, curr) => acc + curr.value, 0);

    return sum / slice.length;
};

/* Trend: differenza tra ultimo e penultimo valore */
export const getSensorTrend = (state, key, metric) => {
    const arr = state.values[key]?.[metric];

    if (!arr || arr.length < 2) return null;

    return arr[arr.length - 1].value - arr[arr.length - 2].value;
};