export const TOPICS = {
    solar_array: {
        key: "solar_array",
        label: "Solar Array",
        defaultChartType: "area",
        tags: ["power", "low"]
    },
    radiation: {
        key: "radiation",
        label: "Radiation",
        defaultChartType: "line",
        tags: ["environment", "medium"]
    },
    life_support: {
        key: "life_support",
        label: "Life Support",
        defaultChartType: "line",
        tags: ["environment", "high"]
    },
    thermal_loop: {
        key: "thermal_loop",
        label: "Thermal Loop",
        defaultChartType: "area",
        tags: ["thermal", "medium"]
    },
    power_bus: {
        key: "power_bus",
        label: "Power Bus",
        defaultChartType: "bar",
        tags: ["power", "medium"]
    },
    power_consumption: {
        key: "power_consumption",
        label: "Power Consumption",
        defaultChartType: "bar",
        tags: ["power", "low"]
    },
    airlock: {
        key: "airlock",
        label: "Airlock",
        defaultChartType: "line",
        tags: ["airlock", "high"]
    }
};