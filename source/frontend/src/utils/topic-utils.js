import { TOPICS } from "../constants/enums/topics";

export const getAllTopics = (topicsState) => {

    if (!topicsState?.values) return Object.values(TOPICS);

    const staticTopics = Object.values(TOPICS);

    const dynamicTopics = Object.keys(topicsState.values)
        .filter(key => !staticTopics.some(t => t.key === key))
        .map(key => ({
            key,
            label: topicsState.values[key]?.label || key,
            defaultChartType: "line",
            tags: []
        }));

    return [
        ...staticTopics,
        ...dynamicTopics
    ];
};