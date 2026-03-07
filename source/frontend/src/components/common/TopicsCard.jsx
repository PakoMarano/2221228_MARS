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
                    const displayValue = lastValue !== null ? lastValue.value : "-";

                    return (
                        <div key={topic.key} className="card-item">
                            <span className="card-item-label card-item-label-margin">
                                {topic.label}
                            </span>

                            <span className="card-item-value card-item-value-end">
                                {displayValue} {topic.unit || ""}
                            </span>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default TopicsCard;