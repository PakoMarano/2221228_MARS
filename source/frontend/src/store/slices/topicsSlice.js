import { TOPICS } from "../../constants/enums/topics";

/* ---------------- STATO INIZIALE ---------------- */
export const initialTopicsState = {
    values: Object.values(TOPICS).reduce((acc, topic) => {
        acc[topic.key] = [];
        return acc;
    }, {})
};

/* ---------------- AZIONI ---------------- */
export const TOPICS_ACTIONS = {
    ADD_VALUE: "TOPICS_ADD_VALUE",
    ADD_BATCH: "TOPICS_ADD_BATCH"
};

/* Action creator per singolo valore */
export const addTopicValue = (key, value, timestamp) => ({
    type: TOPICS_ACTIONS.ADD_VALUE,
    payload: { key, value, timestamp }
});

/* Action creator per batch */
export const addTopicsBatch = (data) => ({
    type: TOPICS_ACTIONS.ADD_BATCH,
    payload: data
});

/* ---------------- REDUCER ---------------- */
const MAX_HISTORY = 500;

export const topicsReducer = (state, action) => {
    switch (action.type) {

        case TOPICS_ACTIONS.ADD_VALUE: {
            const { key, value, timestamp } = action.payload;

            return {
                ...state,
                values: {
                    ...state.values,
                    [key]: [
                        ...state.values[key],
                        { value, timestamp: timestamp ?? Date.now() }
                    ].slice(-MAX_HISTORY)
                }
            };
        }

        case TOPICS_ACTIONS.ADD_BATCH: {
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

/* Ultimo valore di un topic */
export const getLastTopicValue = (state, key) => {
    const arr = state.values[key];
    return arr.length > 0 ? arr[arr.length - 1] : null;
};

/* Media ultimi N valori */
export const getTopicAverage = (state, key, n = 10) => {
    const arr = state.values[key];
    if (!arr.length) return null;
    const slice = arr.slice(-n);
    const sum = slice.reduce((acc, curr) => acc + curr.value, 0);
    return sum / slice.length;
};

/* Trend: differenza tra ultimo e penultimo valore */
export const getTopicTrend = (state, key) => {
    const arr = state.values[key];
    if (arr.length < 2) return null;
    return arr[arr.length - 1].value - arr[arr.length - 2].value;
};