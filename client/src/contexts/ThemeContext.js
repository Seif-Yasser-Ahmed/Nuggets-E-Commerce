// client/src/contexts/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for theme management
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// ThemeProvider component to wrap the application
export const ThemeProvider = ({ children }) => {
    // Initialize dark mode from localStorage or system preference
    const [darkMode, setDarkMode] = useState(() => {
        const stored = localStorage.getItem('darkMode');
        if (stored !== null) return stored === 'true';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // Dark mode palette
    const darkPalette = {
        background: '#121212',
        surface: '#1E1E1E',
        primary: '#90CAF9',
        secondary: '#B39DDB',
        text: '#FFFFFF',
        textSecondary: '#DDDDDD',
        divider: '#2D2D2D',
        error: '#CF6679',
        success: '#4CAF50',
        warning: '#FFCA28',
        info: '#64B5F6',
        hover: 'rgba(255, 255, 255, 0.08)',
        active: 'rgba(255, 255, 255, 0.12)',
        card: '#1F1F1F',
        input: '#2D2D2D',
        border: '#333333',
        elevation: '0px 4px 8px rgba(0, 0, 0, 0.5)'
    };

    const lightPalette = {
        background: '#F5F5F5',
        surface: '#FFFFFF',
        primary: '#1976D2',
        secondary: '#673AB7',
        text: '#212121',
        textSecondary: '#757575',
        divider: '#EEEEEE',
        error: '#D32F2F',
        success: '#388E3C',
        warning: '#F57C00',
        info: '#1976D2',
        hover: 'rgba(0, 0, 0, 0.04)',
        active: 'rgba(0, 0, 0, 0.08)',
        card: '#FFFFFF',
        input: '#F5F5F5',
        border: '#E0E0E0',
        elevation: '0px 2px 4px rgba(0, 0, 0, 0.1)'
    };

    // Apply dark mode to document root element and persist in localStorage
    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            // Set CSS variables for dark mode
            Object.entries(darkPalette).forEach(([key, value]) => {
                root.style.setProperty(`--color-${key}`, value);
            });

            // Update global text styles for dark mode
            document.body.style.color = '#FFFFFF';
            const allTextElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a, li, td, th');
            allTextElements.forEach(el => {
                // Only apply if no specific color is already set or if it's a dark color
                const currentColor = window.getComputedStyle(el).color;
                if (currentColor === 'rgb(33, 33, 33)' || currentColor === '#212121') {
                    el.style.color = '#FFFFFF';
                }
            });
        } else {
            root.classList.remove('dark');
            // Set CSS variables for light mode
            Object.entries(lightPalette).forEach(([key, value]) => {
                root.style.setProperty(`--color-${key}`, value);
            });

            // Reset text colors in light mode
            document.body.style.color = '';
            const allTextElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, button, a, li, td, th');
            allTextElements.forEach(el => {
                // Only reset if we previously set it
                if (el.style.color === '#FFFFFF') {
                    el.style.color = '';
                }
            });
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Toggle dark mode function
    const toggleDarkMode = () => {
        setDarkMode(prevMode => !prevMode);
    };

    // Values to be provided by the context
    const value = {
        darkMode,
        toggleDarkMode,
        palette: darkMode ? darkPalette : lightPalette
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;