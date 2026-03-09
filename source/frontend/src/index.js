import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { StoreProvider } from "./store/store";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <StoreProvider>
        <App />
    </StoreProvider>
);