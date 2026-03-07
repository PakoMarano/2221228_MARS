import React, { useEffect, useState } from "react";
import { useStore } from "../../store/store";
import { ACTUATORS } from "../../constants/enums/actuators";
import { SENSORS } from "../../constants/enums/sensors";
import { TOPICS } from "../../constants/enums/topics";
import { getAllRules, deleteRule } from "../../store/slices/rulesSlice";
import { useRules } from "../../hooks/useRules";
import ConfirmModal from "../common/ConfirmModal";
import RuleModal from "../common/RuleModal";

const Controls = () => {
    const { state, dispatch } = useStore();
    const rules = getAllRules(state.rules);

    const { fetchRules, createNewRule, updateExistingRule, removeRule } = useRules();

    const [deleteId, setDeleteId] = useState(null);
    const [editingRule, setEditingRule] = useState(null);
    const [isRuleModalOpen, setRuleModalOpen] = useState(false);

    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedRules = [...rules].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue =
            sortConfig.key === "sensorId"
                ? SENSORS[a.sensorId]?.label || TOPICS[a.sensorId]?.label || a.sensorId
                : sortConfig.key === "actuator"
                    ? ACTUATORS[a.actuator]?.label || a.actuator
                    : a[sortConfig.key];

        const bValue =
            sortConfig.key === "sensorId"
                ? SENSORS[b.sensorId]?.label || TOPICS[b.sensorId]?.label || b.sensorId
                : sortConfig.key === "actuator"
                    ? ACTUATORS[b.actuator]?.label || b.actuator
                    : b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === "asc" ? (
            <i className="bi bi-caret-up-fill"></i>
        ) : (
            <i className="bi bi-caret-down-fill"></i>
        );
    };

    const handleDelete = (id) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        await removeRule(deleteId);
        setDeleteId(null);
    };

    const handleNewRule = () => {
        setEditingRule(null);
        setRuleModalOpen(true);
    };

    const handleEdit = (rule) => {
        setEditingRule(rule);
        setRuleModalOpen(true);
    };

    const handleSaveRule = async (data) => {
        if (editingRule) {
            await updateExistingRule(editingRule.id, data);
        } else {
            await createNewRule(data);
        }

        setRuleModalOpen(false);
    };

    useEffect(() => {
        fetchRules();
    }, []);

    return (
        <div className="page actuators-page">
            <table className="rules-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort("sensorId")} style={{ cursor: "pointer" }}>
                            Sensor name {getSortIcon("sensorId")}
                        </th>
                        <th onClick={() => handleSort("operator")} style={{ cursor: "pointer" }}>
                            Operator {getSortIcon("operator")}
                        </th>
                        <th onClick={() => handleSort("threshold")} style={{ cursor: "pointer" }}>
                            Threshold {getSortIcon("threshold")}
                        </th>
                        <th onClick={() => handleSort("actuator")} style={{ cursor: "pointer" }}>
                            Actuator {getSortIcon("actuator")}
                        </th>
                        <th onClick={() => handleSort("setTo")} style={{ cursor: "pointer" }}>
                            Set To {getSortIcon("setTo")}
                        </th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRules.map((rule) => {
                        const sensorLabel =
                            SENSORS[rule.sensorId]?.label ||
                            TOPICS[rule.sensorId]?.label ||
                            rule.sensorId;
                        const actuatorLabel =
                            ACTUATORS[rule.actuator]?.label || rule.actuator;

                        return (
                            <tr key={rule.id}>
                                <td>{sensorLabel}</td>
                                <td>{rule.operator}</td>
                                <td>{rule.threshold}</td>
                                <td>{actuatorLabel}</td>
                                <td>{rule.setTo}</td>
                                <td className="actions-cell">
                                    <i
                                        className="bi bi-pencil-fill"
                                        onClick={() => handleEdit(rule)}
                                    ></i>

                                    <i
                                        className="bi bi-trash-fill"
                                        onClick={() => handleDelete(rule.id)}
                                    ></i>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="new-rule-button">
                <button className="card-button" onClick={handleNewRule}>
                    <i className="bi bi-plus-lg"></i> New Rule
                </button>
            </div>

            <ConfirmModal
                isOpen={deleteId !== null}
                message="Are you sure you want to delete this rule?"
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
            />

            <RuleModal
                isOpen={isRuleModalOpen}
                rule={editingRule}
                onClose={() => setRuleModalOpen(false)}
                onSave={handleSaveRule}
            />
        </div>
    );
};

export default Controls;