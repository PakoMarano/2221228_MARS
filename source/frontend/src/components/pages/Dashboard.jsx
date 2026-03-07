import React, { useEffect } from "react";
import SensorsCard from "../common/SensorsCard";
import TopicsCard from "../common/TopicsCard";
import ActuatorsCard from "../common/ActuatorsCard";
import { PAGES } from "../../constants/navigation";
import { useActuators } from "../../hooks/useActuators";

const Dashboard = ({ goTo }) => {

    const { fetchActuators } = useActuators();

    useEffect(() => {
        fetchActuators();
    }, []);

    return (
        <div className="page dashboard-page">

            <div style={{ display: "flex", flex: 2, gap: "16px", height: "100%" }}>
                <SensorsCard onViewAll={() => goTo(PAGES.SENSORS)} />

                <TopicsCard onViewAll={() => goTo(PAGES.TELEMETRY)} />
            </div>

            <div style={{ flex: 1 }}>
                <ActuatorsCard onConfigure={() => goTo(PAGES.CONTROLS)} />
            </div>
        </div>
    );
};

export default Dashboard;