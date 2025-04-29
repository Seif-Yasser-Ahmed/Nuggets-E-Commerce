// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
    // Use the global theme context
    const { darkMode, palette } = useTheme();

    return (
        <div
            style={{
                backgroundColor: darkMode ? palette.background : palette.background,
                color: darkMode ? palette.text : palette.text,
                transition: 'background-color 0.3s ease, color 0.3s ease',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Navbar />
            <main className="flex-grow p-4">
                <Outlet />
            </main>
        </div>
    );
}
