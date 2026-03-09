import { TOPICS } from "../../constants/enums/topics";

/* ---------------- STATO INIZIALE ---------------- */
export const initialTopicsState = {
    values: Object.values(TOPICS).reduce((acc, topic) => {
        acc[topic.key] = {};
        return acc;
    }, {})
};

/* ---------------- AZIONI ---------------- */
export const TOPICS_ACTIONS = {
    ADD_VALUE: "TOPICS_ADD_VALUE",
    ADD_BATCH: "TOPICS_ADD_BATCH"
};

/* Action creator per singolo valore */
export const addTopicValue = (data) => ({
    type: TOPICS_ACTIONS.ADD_VALUE,
    payload: data
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

            const { key, metric, value, unit, status, timestamp } = action.payload;

            const topicMetrics = state.values[key] ?? {};
            const history = topicMetrics[metric] ?? [];

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
                        ...topicMetrics,
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

/* Ultimo valore di un topic */
export const getLastTopicValue = (state, key, metric) => {
    const arr = state.values[key]?.[metric];
    return arr?.length ? arr[arr.length - 1] : null;
};

/* Media ultimi N valori */
export const getTopicAverage = (state, key, metric, n = 10) => {
    const arr = state.values[key]?.[metric];
    if (!arr?.length) return null;

    const slice = arr.slice(-n);
    const sum = slice.reduce((acc, curr) => acc + curr.value, 0);

    return sum / slice.length;
};

/* Trend: differenza tra ultimo e penultimo valore */
export const getTopicTrend = (state, key, metric) => {
    const arr = state.values[key]?.[metric];

    if (!arr || arr.length < 2) return null;

    return arr[arr.length - 1].value - arr[arr.length - 2].value;
};