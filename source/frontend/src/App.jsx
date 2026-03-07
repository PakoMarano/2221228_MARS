import React, { useState } from 'react';
import Dashboard from "./components/pages/Dashboard";
import Sensors from "./components/pages/Sensors";
import Topics from "./components/pages/Topics";
import Actuators from "./components/pages/Actuators";
import { APP } from './constants/app';
import logo from './assets/mars.svg';
import { useWebSocketService } from './services/webSocketService';
import { MENU_ITEMS, PAGES } from './constants/navigation';

const App = () => {
    useWebSocketService();

    const [activePage, setActivePage] = useState(PAGES.DASHBOARD);

    const renderPage = () => {
        switch (activePage) {
            case PAGES.DASHBOARD:
                return <Dashboard goTo={(page) => setActivePage(page)} />;
            case PAGES.SENSORS:
                return <Sensors />;
            case PAGES.TELEMETRY:
                return <Topics />;
            case PAGES.CONTROLS:
                return <Actuators />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="app-container">
            {/* HEADER */}
            <header className="app-header">
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <img src={logo} alt="Logo" style={{ width: "40px", height: "40px" }} />
                    <h1 className="app-title">{APP.NAME}</h1>
                </div>
                <hr className="header-separator" />
                {/* MENU */}
                <nav className="app-menu">
                    <ul>
                        {MENU_ITEMS.map((page) => (
                            <li
                                key={page}
                                className={`menu-item ${activePage === page ? "active" : ""}`}
                                onClick={() => setActivePage(page)}
                            >
                                {page}
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>

            {/* MAIN CONTENT */}
            <main className="app-content">
                {renderPage()}
            </main>
        </div>
    );
};

export default App;