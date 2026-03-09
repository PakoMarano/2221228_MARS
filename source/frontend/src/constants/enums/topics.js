export const TOPICS = {
    solar_array: {
        key: "solar_array",
        label: "Solar Array",
        defaultChartType: "area",
        tags: ["power", "low"]
    },
    radiation: {
        key: "radiation-monitor/habitat-alpha",
        label: "Radiation (habitat alpha)",
        defaultChartType: "line",
        tags: ["environment", "medium"]
    },
    life_support: {
        key: "life-support/habitat-alpha",
        label: "Life Support (habitat alpha)",
        defaultChartType: "line",
        tags: ["environment", "high"]
    },
    thermal_loop: {
        key: "thermal_loop/primary",
        label: "Thermal Loop (primary)",
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
        key: "airlock/airlock-1",
        label: "Airlock (airlock-1)",
        defaultChartType: "line",
        tags: ["airlock", "high"]
    }
};