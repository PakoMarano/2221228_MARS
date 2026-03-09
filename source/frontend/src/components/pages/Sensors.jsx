import React, { useState } from "react";
import Chart from "../ui/Chart";
import { SENSORS } from "../../constants/enums/sensors";
import { useStore } from "../../store/store";

const AREAS = ["greenhouse", "entrance", "hall", "corridor", "water system", "air system"];
const TYPES = ["temperature", "humidity", "co2", "ph", "water level", "pressure", "air quality"];

const Sensors = () => {
    const { state } = useStore();
    const sensorsState = state.sensors;

    const [activeAreas, setActiveAreas] = useState([...AREAS]);
    const [activeTypes, setActiveTypes] = useState([...TYPES]);
    const [metricIndex, setMetricIndex] = useState({});

    const toggleFilter = (filterArray, setFilterArray, value) => {
        if (filterArray.includes(value)) {
            setFilterArray(filterArray.filter(v => v !== value));
        } else {
            setFilterArray([...filterArray, value]);
        }
    };

    const filteredSensors = Object.values(SENSORS).filter(sensor => {
        const sensorAreas = sensor.tags.filter(tag => AREAS.includes(tag));
        const sensorTypes = sensor.tags.filter(tag => TYPES.includes(tag));
        return sensorAreas.some(a => activeAreas.includes(a)) && sensorTypes.some(t => activeTypes.includes(t));
    });

    const handleMetricClick = (key, metrics) => {
        if (metrics.length <= 1) return;
        setMetricIndex(prev => ({
            ...prev,
            [key]: ((prev[key] ?? 0) + 1) % metrics.length
        }));
    };

    return (
        <div className="page sensors-page">
            <div className="filters">
                <div className="filter-group">
                    <span>Habitat Area: </span>
                    {AREAS.map(area => (
                        <button
                            key={area}
                            className={`filter-button ${activeAreas.includes(area) ? "active" : ""}`}
                            onClick={() => toggleFilter(activeAreas, setActiveAreas, area)}
                        >
                            {area}
                        </button>
                    ))}
                </div>

                <div className="filter-group">
                    <span>Measurement: </span>
                    {TYPES.map(type => (
                        <button
                            key={type}
                            className={`filter-button ${activeTypes.includes(type) ? "active" : ""}`}
                            onClick={() => toggleFilter(activeTypes, setActiveTypes, type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card-grid cols-3">
                {filteredSensors.map(sensor => {
                    const metrics = Object.keys(sensorsState.values[sensor.key] ?? {});
                    const currentIndex = metricIndex[sensor.key] ?? 0;
                    const currentMetric = metrics[currentIndex];

                    const data = currentMetric
                        ? sensorsState.values[sensor.key][currentMetric]
                        : [];

                    return (
                        <div
                            key={sensor.key}
                            className="sensors-card"
                            style={{ cursor: metrics.length > 1 ? "pointer" : "default" }}
                            onClick={() => handleMetricClick(sensor.key, metrics)}
                        >
                            <Chart
                                data={data}
                                type={sensor.defaultChartType}
                                unit={data?.[0]?.unit ?? ""}
                                title={`${sensor.label}${metrics.length > 1 ? ` (${currentMetric})` : ""}`}
                                width="100%"
                                height={200}
                            />
                            {metrics.length > 1 && (
                                <div className="metric-hint">
                                    Click to switch metric
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Sensors;