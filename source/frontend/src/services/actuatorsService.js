import api from "./api";

export const getActuatorsState = () => {
    return api.get("/actuators");
};

export const setActuatorState = (actuator_name, value) => {
    return api.post(`/actuators/${actuator_name}`, { state: value });
};