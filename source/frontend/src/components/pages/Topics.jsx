import React, { useState } from "react";
import Chart from "../ui/Chart";
import { TOPICS } from "../../constants/enums/topics";
import { useStore } from "../../store/store";

const TYPES = ["power", "environment", "thermal", "airlock"];
const CRITICALITIES = ["high", "medium", "low"];

const Topics = () => {
    const { state } = useStore();
    const topicsState = state.topics;

    const [activeTypes, setActiveTypes] = useState([...TYPES]);
    const [activeCriticalities, setActiveCriticalities] = useState([...CRITICALITIES]);

    const toggleFilter = (filterArray, setFilterArray, value) => {
        if (filterArray.includes(value)) {
            setFilterArray(filterArray.filter(v => v !== value));
        } else {
            setFilterArray([...filterArray, value]);
        }
    };

    const filteredTopics = Object.values(TOPICS).filter(topic => {
        const topicType = topic.tags[0];
        const topicCriticality = topic.tags[1];
        return activeTypes.includes(topicType) && activeCriticalities.includes(topicCriticality);
    });

    return (
        <div className="page topics-page">
            <div className="filters">
                <div className="filter-group">
                    <span>Type:</span>
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

                <div className="filter-group">
                    <span>Criticality:</span>
                    {CRITICALITIES.map(c => (
                        <button
                            key={c}
                            className={`filter-button ${activeCriticalities.includes(c) ? "active" : ""}`}
                            onClick={() => toggleFilter(activeCriticalities, setActiveCriticalities, c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card-grid cols-3">
                {filteredTopics.map(topic => (
                    <div key={topic.key} className="sensors-card">
                        <Chart
                            data={topicsState.values[topic.key]}
                            type={topic.chartType}
                            unit={topic.unit || ""}
                            title={topic.label}
                            width="100%"
                            height={200}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Topics;