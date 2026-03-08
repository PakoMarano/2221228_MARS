import { ACTUATORS } from "../../constants/enums/actuators";

/* ---------------- STATO INIZIALE ---------------- */
export const initialActuatorsState = {
    values: Object.values(ACTUATORS).reduce((acc, actuator) => {
        acc[actuator.key] = false;
        return acc;
    }, {}),
    lastUpdated: {}
};

/* ---------------- AZIONI ---------------- */
export const ACTUATORS_ACTIONS = {
    TOGGLE: "ACTUATORS_TOGGLE",
    SET: "ACTUATORS_SET",
    SET_BATCH: "ACTUATORS_SET_BATCH"
};

/* Action creator per toggle singolo */
export const toggleActuator = (key, timestamp) => ({
    type: ACTUATORS_ACTIONS.TOGGLE,
    payload: { key, timestamp }
});

/* Action creator per impostare uno stato specifico */
export const setActuator = (key, value, timestamp) => ({
    type: ACTUATORS_ACTIONS.SET,
    payload: { key, value, timestamp }
});

/* Action creator batch */
export const setActuatorsBatch = (data) => ({
    type: ACTUATORS_ACTIONS.SET_BATCH,
    payload: data
});

/* ---------------- REDUCER ---------------- */
export const actuatorsReducer = (state, action) => {
    switch (action.type) {

        case ACTUATORS_ACTIONS.TOGGLE: {
            const { key, timestamp } = action.payload;
            return {
                ...state,
                values: {
                    ...state.values,
                    [key]: !state.values[key]
                },
                lastUpdated: {
                    ...state.lastUpdated,
                    [key]: timestamp ?? Date.now()
                }
            };
        }

        case ACTUATORS_ACTIONS.SET: {
            const { key, value, timestamp } = action.payload;
            return {
                ...state,
                values: {
                    ...state.values,
                    [key]: !!value
                },
                lastUpdated: {
                    ...state.lastUpdated,
                    [key]: timestamp ?? Date.now()
                }
            };
        }

        case ACTUATORS_ACTIONS.SET_BATCH: {
            const newValues = { ...state.values };
            const newLastUpdated = { ...state.lastUpdated };

            Object.entries(action.payload).forEach(([key, item]) => {
                // item = { value, timestamp }
                if (newValues.hasOwnProperty(key)) {
                    newValues[key] = !!item.value;
                    newLastUpdated[key] = item.timestamp ?? newLastUpdated[key];
                }
            });

            return {
                ...state,
                values: newValues,
                lastUpdated: newLastUpdated
            };
        }

        default:
            return state;
    }
};

/* ---------------- SELECTOR UTILI ---------------- */

/* Stato attuale di un actuator */
export const getActuatorState = (state, key) => state.values[key] ?? false;

/* Lista degli actuator attivi */
export const getActiveActuators = (state) =>
    Object.entries(state.values)
        .filter(([_, value]) => value)
        .map(([key]) => key);