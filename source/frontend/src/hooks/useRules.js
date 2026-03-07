import { useCallback } from "react";
import { useStore } from "../store/store";
import {
    setRules,
    addRule,
    updateRule,
    deleteRule
} from "../store/slices/rulesSlice";
import {
    getRules,
    createRule,
    updateRule as updateRuleApi,
    deleteRule as deleteRuleApi
} from "../services/rulesService";

export const useRules = () => {
    const { dispatch } = useStore();

    const fetchRules = useCallback(async () => {
        try {
            const response = await getRules();
            dispatch(setRules(response.data));
        } catch (err) {
            console.error("Failed to fetch rules:", err);
        }
    }, [dispatch]);

    const createNewRule = useCallback(async (rule) => {
        try {
            const response = await createRule(rule);
            dispatch(addRule(response.data));
        } catch (err) {
            console.error("Failed to create rule:", err);
        }
    }, [dispatch]);

    const updateExistingRule = useCallback(async (id, updates) => {
        try {
            const response = await updateRuleApi(id, updates);
            dispatch(updateRule(id, response.data));
        } catch (err) {
            console.error(`Failed to update rule with id ${id}:`, err);
        }
    }, [dispatch]);

    const removeRule = useCallback(async (id) => {
        try {
            await deleteRuleApi(id);
            dispatch(deleteRule(id));
        } catch (err) {
            console.error(`Failed to delete rule with id ${id}:`, err);
        }
    }, [dispatch]);

    return {
        fetchRules,
        createNewRule,
        updateExistingRule,
        removeRule
    };
};