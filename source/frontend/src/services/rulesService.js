import api from "./api";

export const getRules = () => {
    return api.get("/rules");
};

export const createRule = (rule) => {
    return api.post("/rules", rule);
};

export const updateRule = (id, rule) => {
    return api.patch(`/rules/${id}`, rule);
};

export const deleteRule = (id) => {
    return api.delete(`/rules/${id}`);
};

export const updateRuleStatusApi = (id, status) => {
    return api.patch(`/rules/${id}/status`, { status });
};