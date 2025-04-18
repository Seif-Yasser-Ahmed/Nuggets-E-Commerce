// client/src/components/DarkModeToggle.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { IconButton, Tooltip } from '@mui/joy';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const DarkModeToggle = () => {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} placement="bottom">
            <IconButton
                onClick={toggleDarkMode}
                variant="soft"
                color="neutral"
                aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                size="md"
            >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Tooltip>
    );
};

export default DarkModeToggle;