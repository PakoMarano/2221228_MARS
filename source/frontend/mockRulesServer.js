const express = require("express");
const bodyParser = require("body-parser");

const PORT = 4001;
const app = express();
app.use(bodyParser.json());

// -------------------- REGOLE --------------------
let rules = [
    {
        id: 1,
        sensorId: "greenhouse_temperature",
        operator: ">",
        threshold: 28,
        actuator: "cooling_fan",
        setTo: "ON"
    },
    {
        id: 2,
        sensorId: "entrance_humidity",
        operator: "<=",
        threshold: 40,
        actuator: "entrance_humidifier",
        setTo: "OFF"
    }
];

let nextRuleId = 3;

// GET tutte le regole
app.get("/rules", (req, res) => {
    res.json(rules);
});

// POST aggiunge una nuova regola
app.post("/rules", (req, res) => {
    const { sensorId, operator, threshold, actuator, setTo } = req.body;
    const newRule = {
        id: nextRuleId++,
        sensorId,
        operator,
        threshold,
        actuator,
        setTo
    };
    rules.push(newRule);
    res.json(newRule);
});

// PUT modifica una regola
app.put("/rules/:id", (req, res) => {
    const { id } = req.params;
    const { sensorId, operator, threshold, actuator, setTo } = req.body;
    const rule = rules.find(r => r.id === parseInt(id));
    if (!rule) return res.status(404).json({ error: "Rule not found" });

    rule.sensorId = sensorId ?? rule.sensorId;
    rule.operator = operator ?? rule.operator;
    rule.threshold = threshold ?? rule.threshold;
    rule.actuator = actuator ?? rule.actuator;
    rule.setTo = setTo ?? rule.setTo;

    res.json(rule);
});

// DELETE elimina una regola
app.delete("/rules/:id", (req, res) => {
    const { id } = req.params;
    const index = rules.findIndex(r => r.id === parseInt(id));
    if (index === -1) return res.status(404).json({ error: "Rule not found" });

    const deleted = rules.splice(index, 1)[0];
    res.json(deleted);
});

// Avvia REST server
app.listen(PORT, () => {
    console.log(`Mock Rules REST server running on http://localhost:${PORT}`);
});