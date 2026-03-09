import React from "react";
import Card from "../ui/Card";
import { ACTUATORS } from "../../constants/enums/actuators";
import { useStore } from "../../store/store";
import { useActuators } from "../../hooks/useActuators";

const ActuatorsCard = ({ onConfigure }) => {
    const { state, dispatch } = useStore();
    const actuatorsState = state.actuators;

    const { updateActuator } = useActuators();

    const handleToggle = (key) => {
        const currentValue = actuatorsState.values[key] || false;
        updateActuator(key, !currentValue);
    };

    return (
        <Card
            style={{ flex: 1 }}
            header={
                <div className="card-header-row">
                    <span>System Controls</span>
                    <button className="card-button" onClick={onConfigure}>
                        Configure rules
                        <i className="bi bi-box-arrow-up-right ms-2"></i>
                    </button>
                </div>
            }
        >
            <div className="card-grid cols-2">
                {Object.values(ACTUATORS).map((actuator) => {
                    const lastUpdated = actuatorsState.lastUpdated?.[actuator.key];
                    const displayTime =
                        lastUpdated && !isNaN(new Date(lastUpdated).getTime())
                            ? new Date(lastUpdated).toLocaleTimeString()
                            : null;

                    return (

                        <div key={actuator.key} className="card-item actuator">
                            <span className="card-item-label">
                                {actuator.label}
                                {displayTime && (
                                    <span className="card-item-time actuator">
                                        Last updated {displayTime}
                                    </span>
                                )}
                            </span>

                            <span className="card-item-value card-item-value-center">
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={actuatorsState.values[actuator.key] || false}
                                        onChange={() => handleToggle(actuator.key)}
                                    />
                                    <span className="switch-slider"></span>
                                </label>
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default ActuatorsCard;