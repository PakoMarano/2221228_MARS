import React, { useState } from "react";
import Card from "../ui/Card";
import { SENSORS } from "../../constants/enums/sensors";
import { useStore } from "../../store/store";
import { getLastSensorValue } from "../../store/slices/sensorsSlice";

const SensorsCard = ({ onViewAll }) => {
    const { state } = useStore();
    const sensorsState = state.sensors;

    const [metricIndex, setMetricIndex] = useState({});

    const handleMetricChange = (key, metrics) => {

        if (metrics.length <= 1) return;

        setMetricIndex((prev) => ({
            ...prev,
            [key]: ((prev[key] ?? 0) + 1) % metrics.length
        }));
    };

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

                    const metrics = Object.keys(sensorsState.values[sensor.key] ?? []);
                    const currentIndex = metricIndex[sensor.key] ?? 0;

                    const lastValues = metrics.map(metric =>
                        getLastSensorValue(sensorsState, sensor.key, metric)
                    );

                    const lastValue = lastValues[currentIndex];

                    const displayValue = lastValue?.value ?? "-";
                    const unit = lastValue?.unit ?? "";
                    const timestamp = lastValue?.timestamp;

                    const currentMetricWarning = lastValue?.status === "warning";
                    const anyMetricWarning = lastValues.some(v => v?.status === "warning");

                    const isValidDate =
                        timestamp && !isNaN(new Date(timestamp).getTime());

                    const displayTime = isValidDate
                        ? new Date(timestamp).toLocaleTimeString()
                        : null;

                    return (
                        <div
                            key={sensor.key}
                            className={`card-item 
                                ${currentMetricWarning ? "card-item-metric-warning" : ""}
                                ${!currentMetricWarning && anyMetricWarning ? "card-item-warning" : ""}
                            `}
                            onClick={() => handleMetricChange(sensor.key, metrics)}
                            style={{ cursor: metrics.length > 1 ? "pointer" : "default" }}
                        >
                            <span className="card-item-label card-item-label-margin">
                                {sensor.label}
                                {metrics.length > 1 && (
                                    <i
                                        className="bi bi-arrow-repeat ms-2 metric-switch-icon"
                                        title="Click to change metric"
                                    ></i>
                                )}
                            </span>

                            <div
                                className="w-100 d-flex align-items-center"
                                style={{
                                    justifyContent: displayTime
                                        ? "space-between"
                                        : "flex-end"
                                }}
                            >
                                {displayTime && (
                                    <span className="card-item-time">
                                        Last updated {displayTime}
                                    </span>
                                )}

                                <span className="card-item-value card-item-value-end">
                                    {displayValue} {unit}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default SensorsCard;