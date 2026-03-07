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

const Chart = ({ data, type = "line", title = "", unit = "", height = 300 }) => {
    const titleRef = useRef(null);
    const [chartHeight, setChartHeight] = useState(height);

    const formattedData =
        data && data.length > 0
            ? data.map(d => ({
                ...d,
                time: new Date(d.timestamp).toLocaleTimeString()
            }))
            : [{ time: "N/A", value: 0 }];

    useEffect(() => {
        if (titleRef.current) {
            setChartHeight(height - titleRef.current.offsetHeight - 20);
        }
    }, [title, data]);

    const axisStyle = { fill: "#e5e5e5", fontSize: 12 };

    const renderChart = () => {
        switch (type) {
            case "bar":
                return (
                    <BarChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#595a5e" />
                        <XAxis dataKey="time" tick={axisStyle} />
                        <YAxis unit={unit} tick={axisStyle} />
                        <Tooltip contentStyle={{ backgroundColor: "#2a2d37", border: "none", color: "#fff" }} />
                        <Bar dataKey="value" fill="#ff6b35" />
                    </BarChart>
                );
            case "area":
                return (
                    <AreaChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#595a5e" />
                        <XAxis dataKey="time" tick={axisStyle} />
                        <YAxis unit={unit} tick={axisStyle} />
                        <Tooltip contentStyle={{ backgroundColor: "#2a2d37", border: "none", color: "#fff" }} />
                        <Area type="monotone" dataKey="value" stroke="#ff6b35" fill="#ff6b3522" />
                    </AreaChart>
                );
            case "line":
            default:
                return (
                    <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#595a5e" />
                        <XAxis dataKey="time" tick={axisStyle} />
                        <YAxis unit={unit} tick={axisStyle} />
                        <Tooltip contentStyle={{ backgroundColor: "#2a2d37", border: "none", color: "#fff" }} />
                        <Line type="monotone" dataKey="value" stroke="#ff6b35" />
                    </LineChart>
                );
        }
    };

    return (
        <div style={{ width: "100%", height, padding: "8px 0" }}>
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