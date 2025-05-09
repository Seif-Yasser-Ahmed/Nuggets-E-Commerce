// src/pages/Privacy.js
import React from 'react';
import {
    Container,
    Typography,
    Box,
    Divider,
    List,
    ListItem,
    ListItemDecorator
} from '@mui/joy';
import { Circle as CircleIcon } from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const Privacy = () => {
    const { darkMode } = useTheme();

    return (
        <Container sx={{ py: 6 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                    level="h1"
                    sx={{
                        mb: 2,
                        fontWeight: 'bold',
                        color: darkMode ? 'primary.300' : 'primary.600'
                    }}
                >
                    Privacy Policy
                </Typography>
                <Typography level="body-lg" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                    Last updated: May 9, 2025
                </Typography>
                <Divider sx={{ maxWidth: 200, mx: 'auto', my: 4 }} />
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    1. Introduction
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    Nuggets ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    2. Information We Collect
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    We may collect information about you in a variety of ways. The information we collect may include:
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Typography level="title-md" sx={{ mb: 1, color: darkMode ? 'primary.200' : 'primary.700' }}>
                        2.1 Personal Data
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 2 }}>
                        Personally identifiable information that you voluntarily provide to us when registering an account or placing an order, such as your name, email address, postal address, phone number, and payment information.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography level="title-md" sx={{ mb: 1, color: darkMode ? 'primary.200' : 'primary.700' }}>
                        2.2 Derivative Data
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 2 }}>
                        Information our servers automatically collect when you access our site, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the site.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography level="title-md" sx={{ mb: 1, color: darkMode ? 'primary.200' : 'primary.700' }}>
                        2.3 Financial Data
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 2 }}>
                        Financial information, such as data related to your payment method (e.g., valid credit card number, card type, expiration date) that we may collect when you purchase products from our site. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography level="title-md" sx={{ mb: 1, color: darkMode ? 'primary.200' : 'primary.700' }}>
                        2.4 Cookies
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 2 }}>
                        We may use cookies, web beacons, tracking pixels, and other tracking technologies to help customize the site and improve your experience. When you access the site, your personal information is not collected through the use of tracking technology. Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the site.
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    3. How We Use Your Information
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the site to:
                </Typography>

                <List sx={{ pl: 3 }}>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        Create and manage your account.
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        Process orders and payments.
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        Send you administrative information, such as order confirmations, updates, security alerts, and support messages.
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        Respond to your comments, questions, and requests.
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        Compile anonymous statistical data for research and analysis.
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        Deliver targeted advertising, newsletters, and promotional materials based on your preferences.
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        Increase the efficiency and operation of the site.
                    </ListItem>
                </List>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    4. Disclosure of Your Information
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Typography level="title-md" sx={{ mb: 1, color: darkMode ? 'primary.200' : 'primary.700' }}>
                        4.1 By Law or to Protect Rights
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 2 }}>
                        If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography level="title-md" sx={{ mb: 1, color: darkMode ? 'primary.200' : 'primary.700' }}>
                        4.2 Third-Party Service Providers
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 2 }}>
                        We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography level="title-md" sx={{ mb: 1, color: darkMode ? 'primary.200' : 'primary.700' }}>
                        4.3 Business Transfers
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 2 }}>
                        If we are involved in a merger, acquisition, financing due diligence, reorganization, bankruptcy, receivership, sale of company assets, or transition of service to another provider, your information may be sold or transferred as part of such a transaction.
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    5. Security of Your Information
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    6. Your Rights Regarding Your Information
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    You have certain rights regarding the personal information we collect about you:
                </Typography>

                <List sx={{ pl: 3 }}>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        <Typography>
                            <strong>Right to Access:</strong> You have the right to request details of the personal information we hold about you.
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        <Typography>
                            <strong>Right to Rectification:</strong> You have the right to have any inaccurate personal information about you corrected.
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        <Typography>
                            <strong>Right to Erasure:</strong> You have the right to request that we delete your personal information in certain circumstances.
                        </Typography>
                    </ListItem>
                    <ListItem>
                        <ListItemDecorator>
                            <CircleIcon sx={{ fontSize: 8, color: darkMode ? 'primary.300' : 'primary.600' }} />
                        </ListItemDecorator>
                        <Typography>
                            <strong>Right to Restrict Processing:</strong> You have the right to request that we restrict the processing of your personal information in certain circumstances.
                        </Typography>
                    </ListItem>
                </List>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography level="title-lg" sx={{ mb: 2, color: darkMode ? 'primary.300' : 'primary.600' }}>
                    7. Contact Us
                </Typography>
                <Typography level="body-md" sx={{ mb: 2 }}>
                    If you have questions or comments about this Privacy Policy, please contact us at:
                </Typography>
                <Typography level="body-md" sx={{ mb: 1 }}>
                    Email: seiffyasserr@gmail.com
                </Typography>
                <Typography level="body-md" sx={{ mb: 1 }}>
                    Phone: +201090555883
                </Typography>
                <Typography level="body-md">
                    Address: Ain Shams University, Abdo Basha
                </Typography>
            </Box>
        </Container>
    );
};

export default Privacy;