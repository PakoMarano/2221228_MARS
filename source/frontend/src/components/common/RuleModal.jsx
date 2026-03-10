import React, { useState, useEffect, useMemo } from "react";
import Modal from "../ui/Modal";
import { ACTUATORS } from "../../constants/enums/actuators";
import { SENSORS } from "../../constants/enums/sensors";
import { getAllTopics } from "../../utils/topic-utils";
import { useStore } from "../../store/store";

const RuleModal = ({ isOpen, onClose, onSave, rule }) => {
    const { state } = useStore();
    const topicsState = state.topics;
    const sensorsState = state.sensors;

    const allTopics = useMemo(() => {
        return getAllTopics(topicsState);
    }, [topicsState]);

    const unifiedSensorsTopics = useMemo(() => {

        const sensorsList = Object.entries(SENSORS).map(([key, val]) => ({
            id: key,
            label: `${val.label} (Sensor)`,
            type: "sensor"
        }));

        const topicsList = allTopics.map(topic => ({
            id: topic.key,
            label: `${topic.label} (Topic)`,
            type: "topic"
        }));

        return [
            ...sensorsList,
            ...topicsList
        ];

    }, [allTopics]);

    const defaultSensor = unifiedSensorsTopics[0]?.id || "";
    const defaultActuator = Object.keys(ACTUATORS)[0] || "";

    const initialState = {
        sensorId: defaultSensor,
        operator: ">",
        threshold: 0,
        actuator: defaultActuator,
        setTo: "ON",
        status: true,
        unit: "",
    }

    const [form, setForm] = useState(initialState);

    const [selectedUnit, setSelectedUnit] = useState("");
    const availableUnits = useMemo(() => {
        if (!form.sensorId) return [];

        const isSensor = SENSORS[form.sensorId] !== undefined;

        if (isSensor) {
            const sensorData = sensorsState.values[form.sensorId];
            if (!sensorData) return [];

            const units = Object.keys(sensorData)
                .map(metric => sensorData[metric])
                .flat()
                .map(entry => entry.unit)
                .filter(Boolean);

            return [...new Set(units)];
        } else {
            const topicData = topicsState.values[form.sensorId];
            if (!topicData) return [];

            const metrics = Object.keys(topicData).filter(k => k !== "label");

            const units = metrics
                .map(metric => topicData[metric])
                .flat()
                .map(entry => entry.unit)
                .filter(Boolean);

            return [...new Set(units)];
        }
    }, [form.sensorId, sensorsState, topicsState]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onSave({
            ...form,
            unit: selectedUnit,
            threshold: form.threshold.toString()
        });
    };

    useEffect(() => {
        if (rule) {
            setForm(rule);
        } else {
            setForm(initialState);
        }
    }, [rule, defaultSensor, defaultActuator]);

    useEffect(() => {
        if (availableUnits.length) {
            setSelectedUnit(availableUnits[0]);
        } else {
            setSelectedUnit("");
        }
    }, [availableUnits]);

    return (
        <Modal
            isOpen={isOpen}
            title={rule ? "Edit Rule" : "New Rule"}
            onClose={onClose}
            onConfirm={handleSubmit}
            confirmLabel="Save"
        >
            <div className="rule-form">

                <label>Sensor name</label>
                <select
                    id="sensor"
                    value={form.sensorId}
                    onChange={(e) => handleChange("sensorId", e.target.value)}
                >
                    {unifiedSensorsTopics.map(item => (
                        <option key={item.id} value={item.id}>
                            {item.label}
                        </option>
                    ))}
                </select>

                <label>Operator</label>
                <select
                    id="operator"
                    value={form.operator}
                    onChange={(e) => handleChange("operator", e.target.value)}
                >
                    <option value=">">{">"}</option>
                    <option value="<">{"<"}</option>
                    <option value=">=">{">="}</option>
                    <option value="<=">{"<="}</option>
                    <option value="==">{"=="}</option>
                </select>

                <label>Threshold</label>
                <input
                    id="threshold"
                    type="number"
                    value={form.threshold}
                    onChange={(e) => handleChange("threshold", e.target.value)}
                />

                <small style={{ opacity: 0.7 }}>
                    For string metrics use numeric mapping:
                    DEPRESSURIZING=0, IDLE=1, PRESSURIZING=2
                </small>

                <label>Unit</label>
                <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                >
                    {availableUnits.map(unit => (
                        <option key={unit} value={unit}>
                            {unit}
                        </option>
                    ))}
                </select>

                <label>Actuator</label>
                <select
                    id="actuator"
                    value={form.actuator}
                    onChange={(e) => handleChange("actuator", e.target.value)}
                >
                    {Object.entries(ACTUATORS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                    ))}
                </select>

                <label>Set To</label>
                <select
                    id="value"
                    value={form.setTo}
                    onChange={(e) => handleChange("setTo", e.target.value)}
                >
                    <option value="ON">ON</option>
                    <option value="OFF">OFF</option>
                </select>
            </div>
        </Modal>
    );
};

export default RuleModal;