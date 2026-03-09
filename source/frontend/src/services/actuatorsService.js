import api from "./api";

export const getActuatorsState = () => {
    return api.get("/actuators");
};

export const setActuatorState = (key, value) => {
    return api.post("/actuators", { key, value });
};