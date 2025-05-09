// src/pages/About.js
import React from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Divider,
    AspectRatio
} from '@mui/joy';
import { useTheme } from '../contexts/ThemeContext';

const About = () => {
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
                    About Nuggets
                </Typography>
                <Typography level="body-lg" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                    Welcome to Nuggets - your premier destination for high-quality products and exceptional shopping experiences.
                </Typography>
                <Divider sx={{ maxWidth: 200, mx: 'auto', my: 4 }} />
            </Box>

            <Grid container spacing={4}>
                <Grid xs={12} md={6} sx={{ mb: 4 }}>
                    <AspectRatio
                        ratio="16/9"
                        sx={{
                            borderRadius: 'lg',
                            boxShadow: 'lg',
                            overflow: 'hidden',
                            mb: 2
                        }}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                            alt="Nuggets Store"
                        />
                    </AspectRatio>
                </Grid>

                <Grid xs={12} md={6} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box>
                        <Typography
                            level="h2"
                            sx={{
                                mb: 2,
                                color: darkMode ? 'primary.300' : 'primary.600'
                            }}
                        >
                            Our Story
                        </Typography>
                        <Typography level="body-md" sx={{ mb: 2 }}>
                            Founded in 2023, Nuggets began with a simple mission: to provide customers with a seamless online shopping experience and access to high-quality products at competitive prices.
                        </Typography>
                        <Typography level="body-md">
                            What started as a small e-commerce venture has grown into a trusted shopping destination for thousands of satisfied customers. We believe in the power of exceptional customer service, quality products, and innovative shopping technology to create memorable experiences for our customers.
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Box sx={{ my: 8 }}>
                <Typography
                    level="h2"
                    sx={{
                        mb: 4,
                        textAlign: 'center',
                        color: darkMode ? 'primary.300' : 'primary.600'
                    }}
                >
                    Our Values
                </Typography>

                <Grid container spacing={3}>
                    <Grid xs={12} sm={6} md={4}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography level="title-lg" sx={{ mb: 2 }}>
                                    Customer First
                                </Typography>
                                <Typography>
                                    Our customers are at the heart of everything we do. We're committed to providing exceptional service, support, and shopping experiences.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={4}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography level="title-lg" sx={{ mb: 2 }}>
                                    Quality & Value
                                </Typography>
                                <Typography>
                                    We carefully curate our product selection to ensure we offer only the highest quality items at competitive prices.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={4}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography level="title-lg" sx={{ mb: 2 }}>
                                    Innovation
                                </Typography>
                                <Typography>
                                    We continuously improve our platform and services to create the best possible shopping experience with the latest technology.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ my: 8 }}>
                <Typography
                    level="h2"
                    sx={{
                        mb: 4,
                        textAlign: 'center',
                        color: darkMode ? 'primary.300' : 'primary.600'
                    }}
                >
                    Meet Our Team
                </Typography>

                <Grid container spacing={3}>
                    <Grid xs={12} sm={6} md={4}>
                        <Card variant="outlined" sx={{ textAlign: 'center' }}>
                            <CardContent>
                                <AspectRatio
                                    ratio="1"
                                    sx={{
                                        width: 120,
                                        borderRadius: '50%',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                                        alt="Team Member"
                                    />
                                </AspectRatio>
                                <Typography level="title-lg">
                                    Seif Yasser
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 1 }}>
                                    Founder & CEO
                                </Typography>
                                <Typography level="body-sm">
                                    Passionate entrepreneur with extensive experience in e-commerce and customer satisfaction.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={4}>
                        <Card variant="outlined" sx={{ textAlign: 'center' }}>
                            <CardContent>
                                <AspectRatio
                                    ratio="1"
                                    sx={{
                                        width: 120,
                                        borderRadius: '50%',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                                        alt="Team Member"
                                    />
                                </AspectRatio>
                                <Typography level="title-lg">
                                    Omar Ahmed
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 1 }}>
                                    Chief Product Officer
                                </Typography>
                                <Typography level="body-sm">
                                    Expert in product curation and development with a keen eye for quality and trends.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={4}>
                        <Card variant="outlined" sx={{ textAlign: 'center' }}>
                            <CardContent>
                                <AspectRatio
                                    ratio="1"
                                    sx={{
                                        width: 120,
                                        borderRadius: '50%',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                                        alt="Team Member"
                                    />
                                </AspectRatio>
                                <Typography level="title-lg">
                                    Youssef Tamer
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 1 }}>
                                    CTO
                                </Typography>
                                <Typography level="body-sm">
                                    Technology expert ensuring our platform is secure, fast, and user-friendly.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={4}>
                        <Card variant="outlined" sx={{ textAlign: 'center' }}>
                            <CardContent>
                                <AspectRatio
                                    ratio="1"
                                    sx={{
                                        width: 120,
                                        borderRadius: '50%',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
                                        alt="Team Member"
                                    />
                                </AspectRatio>
                                <Typography level="title-lg">
                                    Mohammed Salah
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 1 }}>
                                    CTO
                                </Typography>
                                <Typography level="body-sm">
                                    Technology expert ensuring our platform is secure, fast, and user-friendly.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={4}>
                        <Card variant="outlined" sx={{ textAlign: 'center' }}>
                            <CardContent>
                                <AspectRatio
                                    ratio="1"
                                    sx={{
                                        width: 120,
                                        borderRadius: '50%',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"
                                        alt="Team Member"
                                    />
                                </AspectRatio>
                                <Typography level="title-lg">
                                    Salma Youssef
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 1 }}>
                                    CTO
                                </Typography>
                                <Typography level="body-sm">
                                    Technology expert ensuring our platform is secure, fast, and user-friendly.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid xs={12} sm={6} md={4}>
                        <Card variant="outlined" sx={{ textAlign: 'center' }}>
                            <CardContent>
                                <AspectRatio
                                    ratio="1"
                                    sx={{
                                        width: 120,
                                        borderRadius: '50%',
                                        mx: 'auto',
                                        mb: 2
                                    }}
                                >
                                    <img
                                        src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=761&q=80"
                                        alt="Team Member"
                                    />
                                </AspectRatio>
                                <Typography level="title-lg">
                                    Salma Hisham
                                </Typography>
                                <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 1 }}>
                                    CTO
                                </Typography>
                                <Typography level="body-sm">
                                    Technology expert ensuring our platform is secure, fast, and user-friendly.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ my: 8, textAlign: 'center' }}>
                <Typography
                    level="h2"
                    sx={{
                        mb: 3,
                        color: darkMode ? 'primary.300' : 'primary.600'
                    }}
                >
                    Our Vision
                </Typography>
                <Typography level="body-lg" sx={{ maxWidth: 800, mx: 'auto' }}>
                    At Nuggets, we envision a world where online shopping is not just convenient but also enjoyable and trustworthy.
                    We're committed to continuous improvement and innovation to deliver the best possible e-commerce experience to our customers.
                </Typography>
            </Box>
        </Container>
    );
};

export default About;