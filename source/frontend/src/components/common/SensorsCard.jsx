import React from "react";
import Card from "../ui/Card";
import { SENSORS } from "../../constants/enums/sensors";
import { useStore } from "../../store/store";
import { getLastSensorValue } from "../../store/slices/sensorsSlice";

const SensorsCard = ({ onViewAll }) => {
    const { state } = useStore();
    const sensorsState = state.sensors;

    return (
        <Card
            style={{ flex: 1 }}
            header={
                <div className="card-header-row">
                    <span>Habitat Sensors</span>
                    <button className="card-button" onClick={onViewAll}>
                        See more
                        <i className="bi bi-box-arrow-up-right ms-2"></i>
                    </button>
                </div>
            }
        >
            <div className="card-grid cols-2">
                {Object.values(SENSORS).map((sensor) => {
                    const lastValue = getLastSensorValue(sensorsState, sensor.key);
                    const displayValue = lastValue !== null ? lastValue.value : "-";

                    return (
                        <div key={sensor.key} className="card-item">
                            <span className="card-item-label card-item-label-margin">
                                {sensor.label}
                            </span>

                            <span className="card-item-value card-item-value-end">
                                {displayValue} {sensor.unit}
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default SensorsCard;