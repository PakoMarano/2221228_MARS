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
        const response = await getRules();
        dispatch(setRules(response.data));
    }, [dispatch]);

    const createNewRule = useCallback(async (rule) => {
        const response = await createRule(rule);
        dispatch(addRule(response.data));
    }, [dispatch]);

    const updateExistingRule = useCallback(async (id, updates) => {
        const response = await updateRuleApi(id, updates);
        dispatch(updateRule(id, response.data));
    }, [dispatch]);

    const removeRule = useCallback(async (id) => {
        await deleteRuleApi(id);
        dispatch(deleteRule(id));
    }, [dispatch]);

    return {
        fetchRules,
        createNewRule,
        updateExistingRule,
        removeRule
    };
};