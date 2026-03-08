import React from "react";
import Card from "../ui/Card";
import { TOPICS } from "../../constants/enums/topics";
import { useStore } from "../../store/store";
import { getLastTopicValue } from "../../store/slices/topicsSlice";

const TopicsCard = ({ onViewAll }) => {
    const { state } = useStore();
    const topicsState = state.topics;

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
                {Object.values(TOPICS).map((topic) => {
                    const lastValue = getLastTopicValue(topicsState, topic.key);
                    const displayValue = lastValue?.value ?? "-";
                    const timestamp = lastValue?.timestamp;

                    const isValidDate = timestamp && !isNaN(new Date(timestamp).getTime());
                    const displayTime = isValidDate ? new Date(timestamp).toLocaleTimeString() : null;

                    return (
                        <div key={topic.key} className="card-item">
                            <span className="card-item-label card-item-label-margin">
                                {topic.label}
                            </span>

                            <div
                                className="w-100 d-flex align-items-center"
                                style={{ justifyContent: displayTime ? "space-between" : "flex-end" }}
                            >
                                {displayTime && (
                                    <span className="card-item-time">
                                        Last updated {displayTime}
                                    </span>
                                )}
                                <span className="card-item-value card-item-value-end">
                                    {displayValue} {topic.unit || ""}
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