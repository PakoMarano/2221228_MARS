import React, { useState } from "react";
import Card from "../ui/Card";
import { useStore } from "../../store/store";
import { getLastTopicValue } from "../../store/slices/topicsSlice";
import { getAllTopics } from "../../utils/topic-utils";

const TopicsCard = ({ onViewAll }) => {
    const { state } = useStore();
    const topicsState = state.topics;

    const allTopics = getAllTopics(topicsState);

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
                    <span>Live Telemetry</span>
                    <button className="card-button" onClick={onViewAll}>
                        See more
                        <i className="bi bi-box-arrow-up-right ms-2"></i>
                    </button>
                </div>
            }
        >
            <div className="card-grid cols-2">
                {allTopics.map((topic) => {
                    const topicData = topicsState.values[topic.key] ?? {};
                    const metrics = Object.keys(topicData).filter(k => k !== "label");
                    const currentIndex = metricIndex[topic.key] ?? 0;
                    const currentMetric = metrics[currentIndex];

                    const lastValue = currentMetric
                        ? getLastTopicValue(topicsState, topic.key, currentMetric)
                        : null;

                    const displayValue = lastValue?.value ?? "-";
                    const unit = lastValue?.unit ?? topic.unit ?? "";
                    const timestamp = lastValue?.timestamp;
                    const status = lastValue?.status;

                    const isValidDate =
                        timestamp && !isNaN(new Date(timestamp).getTime());
                    const displayTime = isValidDate
                        ? new Date(timestamp).toLocaleTimeString()
                        : null;

                    return (
                        <div
                            key={topic.key}
                            className={`card-item ${status === "WARNING" ? "card-item-warning" : ""}`}
                            onClick={() => handleMetricChange(topic.key, metrics)}
                            style={{ cursor: metrics.length > 1 ? "pointer" : "default" }}
                        >
                            <span className="card-item-label card-item-label-margin">
                                {topic.label}
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
                                    justifyContent: displayTime ? "space-between" : "flex-end"
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

export default TopicsCard;