// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Divider,
    List,
    ListItem,
    IconButton,
    Sheet
} from '@mui/joy';
import {
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    Instagram as InstagramIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Language as LanguageIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const Footer = () => {
    const { darkMode } = useTheme();

    // Year for copyright
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                mt: 'auto',
                pt: 6,
                pb: 3,
                bgcolor: darkMode ? 'neutral.900' : 'primary.50',
                color: darkMode ? 'neutral.200' : 'neutral.800',
                borderTop: '1px solid',
                borderColor: darkMode ? 'neutral.800' : 'neutral.200'
            }}
        >
            <Container>
                <Grid container spacing={4} sx={{ mb: 4 }}>
                    {/* Quick Links Section */}
                    <Grid xs={12} sm={6} md={3}>
                        <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                            Quick Links
                        </Typography>
                        <List size="sm" sx={{ p: 0 }}>
                            <ListItem>
                                <Link
                                    to="/"
                                    style={{
                                        color: darkMode ? 'inherit' : 'inherit',
                                        textDecoration: 'none'
                                    }}
                                >
                                    Home
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link
                                    to="/store"
                                    style={{
                                        color: darkMode ? 'inherit' : 'inherit',
                                        textDecoration: 'none'
                                    }}
                                >
                                    Store
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link
                                    to="/cart"
                                    style={{
                                        color: darkMode ? 'inherit' : 'inherit',
                                        textDecoration: 'none'
                                    }}
                                >
                                    Cart
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link
                                    to="/about"
                                    style={{
                                        color: darkMode ? 'inherit' : 'inherit',
                                        textDecoration: 'none'
                                    }}
                                >
                                    About Us
                                </Link>
                            </ListItem>
                        </List>
                    </Grid>

                    {/* About Section */}
                    <Grid xs={12} sm={6} md={3}>
                        <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                            About Nuggets
                        </Typography>
                        <Typography level="body-md" sx={{ mb: 2 }}>
                            Nuggets is a premier e-commerce platform offering high-quality products with exceptional customer service. We're committed to providing a seamless shopping experience with secure payments and fast delivery.
                        </Typography>
                    </Grid>

                    {/* Contact Section */}
                    <Grid xs={12} sm={6} md={3}>
                        <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                            Contact Us
                        </Typography>
                        <List size="sm" sx={{ p: 0 }}>
                            <ListItem sx={{ gap: 1 }}>
                                <LocationIcon fontSize="small" sx={{ color: darkMode ? 'primary.300' : 'primary.500' }} />
                                <Typography level="body-sm">
                                    Ain Shams University, Abdo Basha
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ gap: 1 }}>
                                <PhoneIcon fontSize="small" sx={{ color: darkMode ? 'primary.300' : 'primary.500' }} />
                                <Typography level="body-sm">
                                    +201090555883
                                </Typography>
                            </ListItem>
                            <ListItem sx={{ gap: 1 }}>
                                <EmailIcon fontSize="small" sx={{ color: darkMode ? 'primary.300' : 'primary.500' }} />
                                <Typography level="body-sm">
                                    seiffyasserr@gmail.com
                                </Typography>
                            </ListItem>
                        </List>
                    </Grid>

                    {/* Social Media Section */}
                    <Grid xs={12} sm={6} md={3}>
                        <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                            Follow Us
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <IconButton
                                component="a"
                                href="https://facebook.com"
                                target="_blank"
                                variant="soft"
                                color={darkMode ? "primary" : "primary"}
                                size="md"
                                sx={{
                                    '&:hover': {
                                        bgcolor: darkMode ? 'primary.700' : 'primary.100'
                                    }
                                }}
                            >
                                <FacebookIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://twitter.com"
                                target="_blank"
                                variant="soft"
                                color={darkMode ? "primary" : "primary"}
                                size="md"
                                sx={{
                                    '&:hover': {
                                        bgcolor: darkMode ? 'primary.700' : 'primary.100'
                                    }
                                }}
                            >
                                <TwitterIcon />
                            </IconButton>
                            <IconButton
                                component="a"
                                href="https://instagram.com"
                                target="_blank"
                                variant="soft"
                                color={darkMode ? "primary" : "primary"}
                                size="md"
                                sx={{
                                    '&:hover': {
                                        bgcolor: darkMode ? 'primary.700' : 'primary.100'
                                    }
                                }}
                            >
                                <InstagramIcon />
                            </IconButton>
                        </Box>
                        <Typography level="body-md" sx={{ mt: 2 }}>
                            Stay connected with us on social media for updates, promotions and more!
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3, borderColor: darkMode ? 'neutral.800' : 'neutral.200' }} />

                {/* Bottom Section with Copyright */}
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: { xs: 'center', sm: 'left' }
                }}>
                    <Typography level="body-sm" sx={{ mb: { xs: 2, sm: 0 } }}>
                        © {currentYear} Nuggets. All Rights Reserved.
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }}>
                        <Link
                            to="/terms"
                            style={{
                                color: darkMode ? 'inherit' : 'inherit',
                                textDecoration: 'none',
                                fontSize: '0.875rem'
                            }}
                        >
                            Terms & Conditions
                        </Link>
                        <Link
                            to="/privacy"
                            style={{
                                color: darkMode ? 'inherit' : 'inherit',
                                textDecoration: 'none',
                                fontSize: '0.875rem'
                            }}
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            to="/faq"
                            style={{
                                color: darkMode ? 'inherit' : 'inherit',
                                textDecoration: 'none',
                                fontSize: '0.875rem'
                            }}
                        >
                            FAQ
                        </Link>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;