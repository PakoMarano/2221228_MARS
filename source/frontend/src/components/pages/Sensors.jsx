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
                {filteredSensors.map(sensor => (
                    <div key={sensor.key} className="sensors-card">
                        <Chart
                            data={sensorsState.values[sensor.key]}
                            type={sensor.chartType}
                            unit={sensor.unit}
                            title={sensor.label}
                            width="100%"
                            height={200}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sensors;