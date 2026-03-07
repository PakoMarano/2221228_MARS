export const SENSORS = {
    greenhouse_temperature: {
        key: "greenhouse_temperature",
        label: "Greenhouse Temperature",
        unit: "°C",
        chartType: "line",
        tags: ["greenhouse", "temperature"]
    },
    entrance_humidity: {
        key: "entrance_humidity",
        label: "Entrance Humidity",
        unit: "%",
        chartType: "line",
        tags: ["entrance", "humidity"]
    },
    co2_hall: {
        key: "co2_hall",
        label: "CO₂ Hall",
        unit: "ppm",
        chartType: "bar",
        tags: ["hall", "co2"]
    },
    hydroponic_ph: {
        key: "hydroponic_ph",
        label: "Hydroponic pH",
        unit: "pH",
        chartType: "line",
        tags: ["greenhouse", "ph"]
    },
    water_tank_level: {
        key: "water_tank_level",
        label: "Water Tank Level",
        unit: "L",
        chartType: "area",
        tags: ["water system", "water level"]
    },
    corridor_pressure: {
        key: "corridor_pressure",
        label: "Corridor Pressure",
        unit: "Pa",
        chartType: "line",
        tags: ["corridor", "pressure"]
    },
    air_quality_pm25: {
        key: "air_quality_pm25",
        label: "Air Quality PM2.5",
        unit: "µg/m³",
        chartType: "bar",
        tags: ["air system", "air quality"]
    },
    air_quality_voc: {
        key: "air_quality_voc",
        label: "Air Quality VOC",
        unit: "ppb",
        chartType: "bar",
        tags: ["air system", "air quality"]
    }
};