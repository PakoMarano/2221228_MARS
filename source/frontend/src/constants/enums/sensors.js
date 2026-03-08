export const SENSORS = {
    greenhouse_temperature: {
        key: "greenhouse_temperature",
        label: "Greenhouse Temperature",
        defaultChartType: "line",
        tags: ["greenhouse", "temperature"]
    },
    entrance_humidity: {
        key: "entrance_humidity",
        label: "Entrance Humidity",
        defaultChartType: "line",
        tags: ["entrance", "humidity"]
    },
    co2_hall: {
        key: "co2_hall",
        label: "CO₂ Hall",
        defaultChartType: "bar",
        tags: ["hall", "co2"]
    },
    hydroponic_ph: {
        key: "hydroponic_ph",
        label: "Hydroponic pH",
        defaultChartType: "line",
        tags: ["greenhouse", "ph"]
    },
    water_tank_level: {
        key: "water_tank_level",
        label: "Water Tank Level",
        defaultChartType: "area",
        tags: ["water system", "water level"]
    },
    corridor_pressure: {
        key: "corridor_pressure",
        label: "Corridor Pressure",
        defaultChartType: "line",
        tags: ["corridor", "pressure"]
    },
    air_quality_pm25: {
        key: "air_quality_pm25",
        label: "Air Quality PM",
        defaultChartType: "bar",
        tags: ["air system", "air quality"]
    },
    air_quality_voc: {
        key: "air_quality_voc",
        label: "Air Quality VOC",
        defaultChartType: "bar",
        tags: ["air system", "air quality"]
    }
};