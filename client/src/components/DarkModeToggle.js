// client/src/components/DarkModeToggle.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DarkModeToggle = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="px-3 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {darkMode ? 'Switch to Light' : 'Switch to Dark'}
        </button>
    );
};

export default DarkModeToggle;