// mockServer.js
const WebSocket = require("ws");

const SENSORS = {
    greenhouse_temperature: {
        key: "greenhouse_temperature",
        label: "Greenhouse Temperature",
        unit: "°C"
    },
    entrance_humidity: {
        key: "entrance_humidity",
        label: "Entrance Humidity",
        unit: "%"
    },
    co2_hall: {
        key: "co2_hall",
        label: "CO₂ Hall",
        unit: "ppm"
    },
    hydroponic_ph: {
        key: "hydroponic_ph",
        label: "Hydroponic pH",
        unit: "pH"
    },
    water_tank_level: {
        key: "water_tank_level",
        label: "Water Tank Level",
        unit: "L"
    },
    corridor_pressure: {
        key: "corridor_pressure",
        label: "Corridor Pressure",
        unit: "Pa"
    },
    air_quality_pm25: {
        key: "air_quality_pm25",
        label: "Air Quality PM2.5",
        unit: "µg/m³"
    },
    air_quality_voc: {
        key: "air_quality_voc",
        label: "Air Quality VOC",
        unit: "ppb"
    },
};

const TOPICS = {
    solar_array: {
        key: "solar_array",
        label: "Solar Array",
        unit: "kW"
    },
    radiation: {
        key: "radiation",
        label: "Radiation",
        unit: "mSv/h"
    },
    life_support: {
        key: "life_support",
        label: "Life Support",
        unit: null
    },
    thermal_loop: {
        key: "thermal_loop",
        label: "Thermal Loop",
        unit: "°C"
    },
    power_bus: {
        key: "power_bus",
        label: "Power Bus",
        unit: "V"
    },
    power_consumption: {
        key: "power_consumption",
        label: "Power Consumption",
        unit: "kW"
    },
    airlock: {
        key: "airlock",
        label: "Airlock",
        unit: null
    },
};

const ACTUATORS = {
    cooling_fan: {
        key: "cooling_fan",
        label: "Cooling Fan",
    },
    entrance_humidifier: {
        key: "entrance_humidifier",
        label: "Entrance Humidifier",
    },
    hall_ventilation: {
        key: "hall_ventilation",
        label: "Hall Ventilation",
    },
    habitat_heater: {
        key: "habitat_heater",
        label: "Habitat Heater",
    },
};

const PORT = 4000;
const wss = new WebSocket.Server({ port: PORT });

console.log(`Mock WebSocket server running on ws://localhost:${PORT}`);

const getRandomValue = (key, category) => {
    if (category === "sensor") {
        switch (key) {
            case "greenhouse_temperature": return +(20 + Math.random() * 5).toFixed(1);
            case "entrance_humidity": return Math.floor(40 + Math.random() * 20);
            case "co2_hall": return Math.floor(380 + Math.random() * 50);
            case "hydroponic_ph": return +(6 + Math.random()).toFixed(1);
            case "water_tank_level": return Math.floor(100 + Math.random() * 50);
            case "corridor_pressure": return 101325 + Math.floor(Math.random() * 500);
            case "air_quality_pm25": return Math.floor(Math.random() * 20);
            case "air_quality_voc": return Math.floor(Math.random() * 200);
            default: return 0;
        }
    } else if (category === "topic") {
        switch (key) {
            case "solar_array": return Math.floor(Math.random() * 200);
            case "radiation": return +(Math.random() * 0.1).toFixed(3);
            case "life_support": return Math.random() > 0.1 ? "OK" : "FAIL";
            case "thermal_loop": return +(15 + Math.random() * 5).toFixed(1);
            case "power_bus": return 400 + Math.floor(Math.random() * 20);
            case "power_consumption": return +(50 + Math.random() * 50).toFixed(1);
            case "airlock": return Math.random() > 0.5 ? "Open" : "Closed";
            default: return 0;
        }
    } else if (category === "actuator") {
        return Math.random() > 0.5;
    }
};

// invia messaggi casuali ogni 1-2 secondi
const sendRandomUpdate = (ws) => {
    const categories = ["sensor", "topic", "actuator"];
    const category = categories[Math.floor(Math.random() * categories.length)];

    let key;
    if (category === "sensor") {
        const keys = Object.keys(SENSORS);
        key = keys[Math.floor(Math.random() * keys.length)];
    } else if (category === "topic") {
        const keys = Object.keys(TOPICS);
        key = keys[Math.floor(Math.random() * keys.length)];
    } else {
        const keys = Object.keys(ACTUATORS);
        key = keys[Math.floor(Math.random() * keys.length)];
    }

    const message = JSON.stringify({
        category,
        key,
        value: getRandomValue(key, category),
        timestamp: Date.now()
    });

    ws.send(message);

    // prossimo update casuale
    setTimeout(() => sendRandomUpdate(ws), 1000 + Math.random() * 1000);
};

wss.on("connection", (ws) => {
    console.log("Client connected");
    sendRandomUpdate(ws);
});