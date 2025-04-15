// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useTheme } from '../contexts/ThemeContext';

export default function Layout() {
    // Use the global theme context
    const { darkMode } = useTheme();

    return (
        <div
            className="
        flex flex-col min-h-screen
        bg-gray-100 text-gray-900
        dark:bg-gray-900 dark:text-gray-100
        transition-colors
      "
        >
            <Navbar />
            <main className="flex-grow p-4">
                <Outlet />
            </main>
        </div>
    );
}
