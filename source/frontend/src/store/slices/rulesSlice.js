import { SENSORS } from "../../constants/enums/sensors";
import { TOPICS } from "../../constants/enums/topics";
import { ACTUATORS } from "../../constants/enums/actuators";

/* ---------------- STATO INIZIALE ---------------- */
export const initialRulesState = {
    rules: []
};

/* ---------------- AZIONI ---------------- */
export const RULES_ACTIONS = {
    ADD_RULE: "RULES_ADD_RULE",
    UPDATE_RULE: "RULES_UPDATE_RULE",
    DELETE_RULE: "RULES_DELETE_RULE",
    SET_RULES: "RULES_SET_ALL"
};

/* ---------------- ACTION CREATORS ---------------- */
export const addRule = (rule) => ({
    type: RULES_ACTIONS.ADD_RULE,
    payload: rule
});

export const updateRule = (id, updates) => ({
    type: RULES_ACTIONS.UPDATE_RULE,
    payload: { id, updates }
});

export const deleteRule = (id) => ({
    type: RULES_ACTIONS.DELETE_RULE,
    payload: id
});

export const setRules = (rules) => ({
    type: RULES_ACTIONS.SET_RULES,
    payload: rules
});

/* ---------------- REDUCER ---------------- */
export const rulesReducer = (state, action) => {
    switch (action.type) {
        case RULES_ACTIONS.ADD_RULE: {
            const newRule = {
                id:
                    state.rules.length > 0
                        ? Math.max(...state.rules.map((r) => r.id)) + 1
                        : 1,
                ...action.payload
            };
            return { ...state, rules: [...state.rules, newRule] };
        }

        case RULES_ACTIONS.UPDATE_RULE: {
            const { id, updates } = action.payload;
            return {
                ...state,
                rules: state.rules.map((rule) =>
                    rule.id === id ? { ...rule, ...updates } : rule
                )
            };
        }

        case RULES_ACTIONS.DELETE_RULE: {
            return {
                ...state,
                rules: state.rules.filter((rule) => rule.id !== action.payload)
            };
        }

        case RULES_ACTIONS.SET_RULES: {
            return { ...state, rules: action.payload };
        }

        default:
            return state;
    }
};

/* ---------------- SELECTOR ---------------- */
export const getAllRules = (state) => state.rules;

export const getRuleById = (state, id) =>
    state.rules.find((rule) => rule.id === id) ?? null;

/* Funzioni utili per etichette leggibili */
export const getSensorLabel = (sensorId) =>
    SENSORS[sensorId]?.label || TOPICS[sensorId]?.label || sensorId;

export const getActuatorLabel = (actuatorId) =>
    ACTUATORS[actuatorId]?.label || actuatorId;