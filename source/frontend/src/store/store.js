import React, { createContext, useContext, useReducer } from "react";

// importa i tuoi slice
import { initialSensorsState, sensorsReducer } from "./slices/sensorsSlice";
import { initialTopicsState, topicsReducer } from "./slices/topicsSlice";
import { initialActuatorsState, actuatorsReducer } from "./slices/actuatorsSlice";

/* ---------------- STATE INIZIALE ---------------- */
export const initialState = {
    sensors: initialSensorsState,
    topics: initialTopicsState,
    actuators: initialActuatorsState,
};

/* ---------------- REDUCER COMBINATO ---------------- */
export const rootReducer = (state, action) => ({
    sensors: sensorsReducer(state.sensors, action),
    topics: topicsReducer(state.topics, action),
    actuators: actuatorsReducer(state.actuators, action),
});

/* ---------------- CONTEXT ---------------- */
const StoreContext = createContext();

/* ---------------- PROVIDER ---------------- */
export const StoreProvider = ({ children }) => {
    const [state, dispatch] = useReducer(rootReducer, initialState);

    return (
        <StoreContext.Provider value={{ state, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
};

/* ---------------- HOOK ---------------- */
export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
};