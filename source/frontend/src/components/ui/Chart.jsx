import React, { useRef, useState, useEffect } from "react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { processDataForChart } from "../../utils/chart-utils";

const Chart = ({ data, type = "line", title = "", unit = "", height = 300 }) => {
    const titleRef = useRef(null);
    const [chartHeight, setChartHeight] = useState(height);

    const formattedData = processDataForChart(data);

    useEffect(() => {
        if (titleRef.current) {
            setChartHeight(height - titleRef.current.offsetHeight - 20);
        }
    }, [title, data]);

    const axisStyle = { fill: "#e5e5e5", fontSize: 12 };

    const renderChart = () => {
        const commonProps = { data: formattedData, margin: { top: 5, right: 20, bottom: 5, left: 0 } };

        const LineOrAreaProps = { type: "monotone", dataKey: "numericValue", stroke: "#ff6b35", dot: { r: 3 } };
        const AreaProps = { ...LineOrAreaProps, fill: "#ff6b3522", dot: false };
        const BarProps = { dataKey: "numericValue", fill: "#ff6b35" };

        const CustomTooltip = ({ active, payload, label }) => {
            if (active && payload && payload.length) {
                return (
                    <div style={{ backgroundColor: "#2a2d37", padding: "8px", color: "#fff", borderRadius: 4 }}>
                        <div>{label}</div>
                        <div>Value: {payload[0].payload.originalValue}</div>
                    </div>
                );
            }
            return null;
        };

        switch (type) {
            case "bar":
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#595a5e" />
                        <XAxis dataKey="time" tick={axisStyle} />
                        <YAxis unit={unit} tick={axisStyle} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar {...BarProps} />
                    </BarChart>
                );
            case "area":
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#595a5e" />
                        <XAxis dataKey="time" tick={axisStyle} />
                        <YAxis unit={unit} tick={axisStyle} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area {...AreaProps} />
                    </AreaChart>
                );
            case "line":
            default:
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#595a5e" />
                        <XAxis dataKey="time" tick={axisStyle} />
                        <YAxis unit={unit} tick={axisStyle} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line {...LineOrAreaProps} />
                    </LineChart>
                );
        }
    };

    return (
        <div
            style={{ width: "100%", height, padding: "8px 0" }}
        >
            {title && (
                <h4 ref={titleRef} style={{ margin: "0 0 16px 8px", color: "#e5e5e5" }}>
                    {title}
                </h4>
            )}
            <ResponsiveContainer width="100%" height={chartHeight}>
                {renderChart()}
            </ResponsiveContainer>
        </div>
    );
};

export default Chart;