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
    const [metricIndex, setMetricIndex] = useState({});

    const toggleFilter = (filterArray, setFilterArray, value) => {
        if (filterArray.includes(value)) {
            setFilterArray(filterArray.filter(v => v !== value));
        } else {
            setFilterArray([...filterArray, value]);
        }
    };

    const allTopics = [
        // prima i topics fissi
        ...Object.values(TOPICS),
        // poi quelli dinamici dallo state che non erano in TOPICS
        ...Object.keys(topicsState.values)
            .filter(key => !Object.values(TOPICS).some(t => t.key === key))
            .map(key => {
                const topicData = topicsState.values[key];
                return {
                    key,
                    label: topicData.label || key,
                    defaultChartType: "line",
                    tags: []
                };
            })
    ];

    const filteredTopics = allTopics.filter(topic => {
        if (!topic.tags || topic.tags.length === 0) return true;
        const topicType = topic.tags[0];
        const topicCriticality = topic.tags[1];
        return activeTypes.includes(topicType) && activeCriticalities.includes(topicCriticality);
    });

    const handleMetricClick = (key, metrics) => {
        if (!metrics || metrics.length <= 1) return;
        setMetricIndex(prev => ({
            ...prev,
            [key]: ((prev[key] ?? 0) + 1) % metrics.length
        }));
    };

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
                {filteredTopics.map(topic => {

                    const topicData = topicsState.values[topic.key] ?? {};

                    const metrics = Object.keys(topicData)
                        .filter(k => k !== "label");

                    const hasMultipleMetrics = metrics.length > 1;

                    const currentIndex = metricIndex[topic.key] ?? 0;
                    const currentMetric = metrics[currentIndex];

                    const dataToDisplay = currentMetric
                        ? topicData[currentMetric]
                        : [];

                    return (
                        <div
                            key={topic.key}
                            className="sensors-card"
                            style={{ cursor: hasMultipleMetrics ? "pointer" : "default" }}
                            onClick={hasMultipleMetrics ? () => handleMetricClick(topic.key, metrics) : undefined}
                        >
                            <Chart
                                data={dataToDisplay}
                                type={topic.chartType || topic.defaultChartType}
                                unit={topic.unit || ""}
                                title={`${topic.label}${hasMultipleMetrics ? ` (${currentMetric})` : ""}`}
                                width="100%"
                                height={200}
                            />

                            {hasMultipleMetrics && (
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

export default Topics;