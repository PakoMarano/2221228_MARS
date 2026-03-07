export const TOPICS = {
    solar_array: {
        key: "solar_array",
        label: "Solar Array",
        unit: "kW",
        chartType: "area",
        tags: ["power", "low"]
    },
    radiation: {
        key: "radiation",
        label: "Radiation",
        unit: "mSv/h",
        chartType: "line",
        tags: ["environment", "medium"]
    },
    life_support: {
        key: "life_support",
        label: "Life Support",
        unit: null,
        chartType: "line",
        tags: ["environment", "high"]
    },
    thermal_loop: {
        key: "thermal_loop",
        label: "Thermal Loop",
        unit: "°C",
        chartType: "area",
        tags: ["thermal", "medium"]
    },
    power_bus: {
        key: "power_bus",
        label: "Power Bus",
        unit: "V",
        chartType: "bar",
        tags: ["power", "medium"]
    },
    power_consumption: {
        key: "power_consumption",
        label: "Power Consumption",
        unit: "kW",
        chartType: "bar",
        tags: ["power", "low"]
    },
    airlock: {
        key: "airlock",
        label: "Airlock",
        unit: null,
        chartType: "line",
        tags: ["airlock", "high"]
    }
};