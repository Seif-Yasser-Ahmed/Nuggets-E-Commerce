// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
    // Use the global theme context
    const { darkMode } = useTheme();

    return (
        <nav className="
      flex items-center justify-between p-4
      bg-gray-100 text-gray-900
      dark:bg-gray-900 dark:text-gray-100
      transition-colors
    ">
            <div className="space-x-4">
                <Link to="/" className="hover:underline">Home</Link>
                <Link to="/signin" className="hover:underline">Sign In</Link>
                <Link to="/signup" className="hover:underline">Sign Up</Link>
                <Link to="/profile" className="hover:underline">Profile</Link>
            </div>

            <DarkModeToggle />
        </nav>
    );
}
