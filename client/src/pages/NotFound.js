// client/src/pages/NotFound.js
import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/joy';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NotFound = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: darkMode ? 'neutral.900' : 'neutral.50',
                color: darkMode ? 'white' : 'inherit'
            }}
        >
            <Container maxWidth="sm">
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 6,
                        px: 4,
                        borderRadius: 'lg',
                        bgcolor: darkMode ? 'neutral.800' : 'white',
                        boxShadow: 'md'
                    }}
                >
                    <ErrorOutlineIcon
                        sx={{
                            fontSize: 80,
                            color: 'warning.500',
                            mb: 2
                        }}
                    />

                    <Typography level="h2" sx={{ mb: 1, color: darkMode ? 'neutral.200' : 'neutral.800' }}>
                        404
                    </Typography>

                    <Typography level="h4" sx={{ mb: 2, color: darkMode ? 'neutral.200' : 'neutral.800' }}>
                        Page Not Found
                    </Typography>

                    <Typography level="body-md" sx={{ mb: 4, color: darkMode ? 'neutral.400' : 'neutral.600' }}>
                        The page you're looking for doesn't exist or you don't have permission to access it.
                    </Typography>

                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="outlined"
                            color="neutral"
                            startDecorator={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>

                        <Button
                            variant="solid"
                            color="primary"
                            startDecorator={<HomeIcon />}
                            onClick={() => navigate('/')}
                        >
                            Home Page
                        </Button>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
};

export default NotFound;