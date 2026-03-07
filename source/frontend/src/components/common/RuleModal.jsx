import React, { useState, useEffect, useMemo } from "react";
import Modal from "../ui/Modal";
import { ACTUATORS } from "../../constants/enums/actuators";
import { SENSORS } from "../../constants/enums/sensors";
import { TOPICS } from "../../constants/enums/topics";

const RuleModal = ({ isOpen, onClose, onSave, rule }) => {
    const [form, setForm] = useState({
        sensorId: "",
        operator: ">",
        threshold: "",
        actuator: "",
        setTo: "ON"
    });

    const unifiedSensorsTopics = useMemo(() => {
        const sensorsList = Object.entries(SENSORS).map(([key, val]) => ({
            id: key,
            label: `${val.label} (Sensor)`
        }));
        const topicsList = Object.entries(TOPICS).map(([key, val]) => ({
            id: key,
            label: `${val.label} (Topic)`
        }));
        return [...sensorsList, ...topicsList];
    }, []);

    useEffect(() => {
        if (rule) {
            setForm(rule);
        } else {
            setForm({
                sensorId: "",
                operator: ">",
                threshold: "",
                actuator: "",
                setTo: "ON"
            });
        }
    }, [rule]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        onSave(form);
    };

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
                    type="number"
                    value={form.threshold}
                    onChange={(e) => handleChange("threshold", e.target.value)}
                />

                <label>Actuator</label>
                <select
                    value={form.actuator}
                    onChange={(e) => handleChange("actuator", e.target.value)}
                >
                    {Object.entries(ACTUATORS).map(([key, val]) => (
                        <option key={key} value={key}>{val.label}</option>
                    ))}
                </select>

                <label>Set To</label>
                <select
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