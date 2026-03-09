import { TOPICS } from "../../constants/enums/topics";

/* ---------------- STATO INIZIALE ---------------- */
export const initialTopicsState = {
    values: {}
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

// Funzione per creare la label dal key dinamico
const createLabelFromKey = (key) => {
    if (!key.includes("/")) {
        return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    } else {
        const parts = key.split("/");
        const main = parts.slice(0, -1)
            .map(p => p.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()))
            .join(" ");
        const last = parts[parts.length - 1];
        return `${main} (${last})`;
    }
};

export const topicsReducer = (state, action) => {

    switch (action.type) {

        case TOPICS_ACTIONS.ADD_VALUE: {
            const { key: rawKey, metric, value, unit, status, timestamp } = action.payload;

            // Rimuovo il prefisso della socket
            const key = rawKey.startsWith("mars/telemetry/")
                ? rawKey.replace("mars/telemetry/", "")
                : rawKey;

            // Controllo se esiste già il topic fisso
            const matchedTopic = Object.values(TOPICS).find(t => t.key === key);

            // Prendo lo stato esistente o creo nuovo oggetto
            const existing = state.values[key] || {};

            // Determino la label
            const topicLabel = existing.label || matchedTopic?.label || createLabelFromKey(key);

            // Copio le metriche esistenti (senza label)
            const topicMetrics = { ...existing };
            delete topicMetrics.label;

            // Aggiorno la history della metrica corrente
            const history = topicMetrics[metric] ?? [];
            const newHistory = [
                ...history,
                { value, timestamp: timestamp ?? Date.now(), unit, status }
            ].slice(-MAX_HISTORY);

            // Ricostruisco il topic
            const newTopicState = {
                label: topicLabel,
                ...topicMetrics,
                [metric]: newHistory
            };

            return {
                ...state,
                values: {
                    ...state.values,
                    [key]: newTopicState
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
    return slice.reduce((acc, curr) => acc + curr.value, 0) / slice.length;
};

/* Trend: differenza tra ultimo e penultimo valore */
export const getTopicTrend = (state, key, metric) => {
    const arr = state.values[key]?.[metric];

    if (!arr || arr.length < 2) return null;

    return arr[arr.length - 1].value - arr[arr.length - 2].value;
};