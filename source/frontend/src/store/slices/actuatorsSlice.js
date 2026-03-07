import { ACTUATORS } from "../../constants/enums/actuators";

/* ---------------- STATO INIZIALE ---------------- */
export const initialActuatorsState = {
    values: Object.values(ACTUATORS).reduce((acc, actuator) => {
        acc[actuator.key] = false; // inizialmente spenti
        return acc;
    }, {})
};

/* ---------------- AZIONI ---------------- */
export const ACTUATORS_ACTIONS = {
    TOGGLE: "ACTUATORS_TOGGLE",
    SET: "ACTUATORS_SET",
    SET_BATCH: "ACTUATORS_SET_BATCH"
};

/* Action creator per toggle singolo */
export const toggleActuator = (key) => ({
    type: ACTUATORS_ACTIONS.TOGGLE,
    payload: key
});

/* Action creator per impostare uno stato specifico */
export const setActuator = (key, value) => ({
    type: ACTUATORS_ACTIONS.SET,
    payload: { key, value }
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
            const key = action.payload;
            return {
                ...state,
                values: {
                    ...state.values,
                    [key]: !state.values[key]
                }
            };
        }

        case ACTUATORS_ACTIONS.SET: {
            const { key, value } = action.payload;
            return {
                ...state,
                values: {
                    ...state.values,
                    [key]: !!value
                }
            };
        }

        case ACTUATORS_ACTIONS.SET_BATCH: {
            const newValues = { ...state.values };
            Object.entries(action.payload).forEach(([key, value]) => {
                if (newValues.hasOwnProperty(key)) {
                    newValues[key] = !!value;
                }
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

/* Stato attuale di un actuator */
export const getActuatorState = (state, key) => state.values[key] ?? false;

/* Lista degli actuator attivi */
export const getActiveActuators = (state) =>
    Object.entries(state.values)
        .filter(([_, value]) => value)
        .map(([key]) => key);