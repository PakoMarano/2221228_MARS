const WebSocket = require("ws");

const SENSORS = {
    greenhouse_temperature: {
        key: "greenhouse_temperature",
        metric: ["temperature"],
        unit: ["C"],
        status: true,
    },
    entrance_humidity: {
        key: "entrance_humidity",
        metric: ["percentage"],
        unit: ["%"],
        status: true,
    },
    co2_hall: {
        key: "co2_hall",
        metric: ["ppm"],
        unit: ["ppm"],
        status: true,
    },
    hydroponic_ph: {
        key: "hydroponic_ph",
        metric: ["ph"],
        unit: ["pH"],
        status: true,
    },
    water_tank_level: {
        key: "water_tank_level",
        metric: ["liters", "percentage"],
        unit: ["l", "%"],
        status: true,
    },
    corridor_pressure: {
        key: "corridor_pressure",
        metric: ["pressure_kpa"],
        unit: ["kPa"],
        status: true,
    },
    air_quality_pm25: {
        key: "air_quality_pm25",
        metric: ["p1", "p25", "p10"],
        unit: ["ug/m3", "ug/m3", "ug/m3"],
        status: true,
    },
    air_quality_voc: {
        key: "air_quality_voc",
        metric: ["voc_ppb", "co2e_ppm"],
        unit: ["ppb", "ppm"],
        status: true,
    },
};

const TOPICS = {
    solar_array: {
        key: "solar_array",
        metric: ["power", "voltage", "current", "cumulative"],
        unit: ["kw", "v", "a", "kwh"],
        status: null,
    },
    radiation: {
        key: "radiation",
        metric: ["radiation"],
        unit: ["uSv/h"],
        status: true,
    },
    life_support: {
        key: "life_support",
        metric: ["oxigen_percent"],
        unit: ["%"],
        status: true,
    },
    thermal_loop: {
        key: "thermal_loop",
        metric: ["temperature", "flow"],
        unit: ["C", "l_min"],
        status: true,
    },
    power_bus: {
        key: "power_bus",
        metric: ["power", "voltage", "current", "cumulative"],
        unit: ["kw", "v", "a", "kwh"],
        status: null,
    },
    power_consumption: {
        key: "power_consumption",
        metric: ["power", "voltage", "current", "cumulative"],
        unit: ["kw", "v", "a", "kwh"],
        status: null,
    },
    airlock: {
        key: "airlock",
        metric: ["cycles_per_hour", "state"],
        unit: ["cycles", "state"],
        status: null,
    },
};

const ACTUATORS = {
    cooling_fan: { key: "cooling_fan" },
    entrance_humidifier: { key: "entrance_humidifier" },
    hall_ventilation: { key: "hall_ventilation" },
    habitat_heater: { key: "habitat_heater" },
};

const PORT = 4000;
const wss = new WebSocket.Server({ port: PORT });

console.log(`Mock WebSocket server running on ws://localhost:${PORT}`);

const getRandomStatus = (statusEnabled) => {
    if (!statusEnabled) return null;
    return Math.random() > 0.8 ? "WARNING" : "OK";
};

const getRandomValue = (metric, category) => {

    switch (metric) {

        case "temperature":
            return +(15 + Math.random() * 10).toFixed(1);

        case "percentage":
        case "oxigen_percent":
            return Math.floor(30 + Math.random() * 70);

        case "ppm":
            return Math.floor(350 + Math.random() * 100);

        case "ph":
            return +(5.5 + Math.random() * 2).toFixed(2);

        case "liters":
            return Math.floor(80 + Math.random() * 70);

        case "pressure_kpa":
            return +(95 + Math.random() * 10).toFixed(2);

        case "p1":
        case "p25":
        case "p10":
            return Math.floor(Math.random() * 40);

        case "voc_ppb":
            return Math.floor(Math.random() * 500);

        case "co2e_ppm":
            return Math.floor(400 + Math.random() * 200);

        case "power":
            return +(20 + Math.random() * 200).toFixed(1);

        case "voltage":
            return +(200 + Math.random() * 50).toFixed(1);

        case "current":
            return +(5 + Math.random() * 20).toFixed(2);

        case "cumulative":
            return +(1000 + Math.random() * 500).toFixed(1);

        case "radiation":
            return +(Math.random() * 0.2).toFixed(3);

        case "flow":
            return +(1 + Math.random() * 10).toFixed(2);

        case "cycles_per_hour":
            return Math.floor(Math.random() * 10);

        case "state":
            return Math.random() > 0.5 ? "Open" : "Closed";

        default:
            if (category === "actuator") {
                return Math.random() > 0.5;
            }
            return 0;
    }
};

// genera un numero casuale da 1 a max, più piccolo ha più probabilità
const getWeightedRandomRuleId = (max = 30) => {
    return Math.floor(1 + (Math.random() ** 2) * (max - 1));
};

// invia messaggi casuali ogni 1-2 secondi
const sendRandomUpdate = (ws) => {

    const categories = ["sensor", "topic", "actuator"];
    const category = categories[Math.floor(Math.random() * categories.length)];

    let source;
    let key;

    if (category === "sensor") {
        const keys = Object.keys(SENSORS);
        key = keys[Math.floor(Math.random() * keys.length)];
        source = SENSORS[key];
    } else if (category === "topic") {
        const keys = Object.keys(TOPICS);
        key = keys[Math.floor(Math.random() * keys.length)];
        source = TOPICS[key];
    } else {
        const keys = Object.keys(ACTUATORS);
        key = keys[Math.floor(Math.random() * keys.length)];
        source = ACTUATORS[key];
    }

    let metric = null;
    let unit = null;
    let value = null;

    if (category !== "actuator") {

        const index = Math.floor(Math.random() * source.metric.length);

        metric = source.metric[index];
        unit = source.unit[index];

        value = getRandomValue(metric, category);

    } else {

        value = getRandomValue(null, "actuator");
        metric = getWeightedRandomRuleId(30).toString();

    }

    const message = JSON.stringify({
        category,
        key,
        metric,
        unit,
        value,
        status: getRandomStatus(source.status),
        timestamp: Date.now()
    });

    ws.send(message);

    setTimeout(() => sendRandomUpdate(ws), 1000 + Math.random() * 1000);
};

wss.on("connection", (ws) => {
    console.log("Client connected");
    sendRandomUpdate(ws);
});