import React from "react";
import Card from "../ui/Card";
import { ACTUATORS } from "../../constants/enums/actuators";
import { useStore } from "../../store/store";
import { toggleActuator } from "../../store/slices/actuatorsSlice";

const ActuatorsCard = ({ onConfigure }) => {
    const { state, dispatch } = useStore();
    const actuatorsState = state.actuators;

    const handleToggle = (key) => {
        dispatch(toggleActuator(key));
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
            <div className="card-grid">
                {Object.values(ACTUATORS).map((actuator) => (
                    <div key={actuator.key} className="card-item">
                        <span className="card-item-label">
                            {actuator.label}
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
                ))}
            </div>
        </Card>
    );
};

export default ActuatorsCard;