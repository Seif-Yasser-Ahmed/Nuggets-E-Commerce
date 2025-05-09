// client/src/pages/Home.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import {
    Box,
    Grid,
    Container,
    Typography,
    CircularProgress,
    Card,
    CardContent,
    Button,
    IconButton,
    Sheet,
    Divider
} from '@mui/joy';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPrompt, setShowPrompt] = useState(false);
    const { darkMode } = useTheme();

    // Carousel state
    const [activeSlide, setActiveSlide] = useState(0);
    const carouselItems = [
        {
            id: 1,
            title: "Summer Sale",
            description: "Get up to 50% off on selected items",
            image: "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&q=80&w=1200",
            buttonText: "Shop Now",
            link: "/store"
        },
        {
            id: 2,
            title: "New Arrivals",
            description: "Check out our latest products",
            image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&q=80&w=1200",
            buttonText: "Discover",
            link: "/store?filter=new"
        },
        {
            id: 3,
            title: "Premium Collection",
            description: "Exclusive high-end products",
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1200",
            buttonText: "Explore",
            link: "/store?category=premium"
        }
    ];

    // Product loading states
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState(null);
    const observer = useRef();
    const PRODUCTS_PER_PAGE = 8;

    // Check if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            setIsLoggedIn(true);
        }
    }, []);

    // Carousel auto-slide
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % carouselItems.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [carouselItems.length]);

    // Carousel navigation
    const nextSlide = () => {
        setActiveSlide((prev) => (prev + 1) % carouselItems.length);
    };

    const prevSlide = () => {
        setActiveSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
    };

    // Infinite scroll implementation with intersection observer
    const lastProductElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Fetch products initially and when page changes
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await getProducts();

                // Check if the response has the expected structure
                const allProducts = response.data || [];

                // Simulate pagination by slicing the data
                const startIndex = 0;
                const endIndex = page * PRODUCTS_PER_PAGE;
                const paginatedProducts = allProducts.slice(startIndex, endIndex);

                setProducts(paginatedProducts);
                setHasMore(paginatedProducts.length < allProducts.length);
                setError(null);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page]);

    // Block back navigation when signed in
    useEffect(() => {
        const handlePopState = (event) => {
            if (localStorage.getItem('user') &&
                (location.pathname === '/signin' || location.pathname === '/signup')) {
                event.preventDefault();
                setShowPrompt(true);
                navigate(location.pathname, { replace: true });
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [location.pathname, navigate]);

    // Handle cancel navigation action
    const handleCancelNavigation = () => {
        setShowPrompt(false);
    };

    const handleSignOut = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        setShowPrompt(false);
        setIsLoggedIn(false);
        navigate('/signin');
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: darkMode ? 'neutral.900' : 'neutral.50',
            color: darkMode ? 'neutral.100' : 'neutral.900',
            pt: 2
        }}>
            {/* Hero Carousel */}
            <Container maxWidth="lg" sx={{ mb: 6 }}>
                <Box
                    sx={{
                        position: 'relative',
                        height: { xs: 300, sm: 400, md: 500 },
                        borderRadius: 'lg',
                        overflow: 'hidden',
                        boxShadow: 'lg'
                    }}
                >
                    {carouselItems.map((item, index) => (
                        <Box
                            key={item.id}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                color: darkMode ? 'primary.300' : 'neutral.800',
                                opacity: activeSlide === index ? 1 : 0,
                                transition: 'opacity 0.5s ease-in-out',
                                background: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${item.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Box sx={{
                                textAlign: 'center',
                                maxWidth: '80%',
                                color: 'white',
                                textShadow: '1px 1px 3px rgba(0,0,0,0.7)',
                                zIndex: 2
                            }}>
                                <Typography level="h2" sx={{ mb: 2, fontWeight: 'bold' }}>
                                    {item.title}
                                </Typography>
                                <Typography level="body-lg" sx={{ mb: 4 }}>
                                    {item.description}
                                </Typography>
                                <Button
                                    component={Link}
                                    to={item.link}
                                    variant="solid"
                                    color="primary"
                                    size="lg"
                                >
                                    {item.buttonText}
                                </Button>
                            </Box>
                        </Box>
                    ))}

                    {/* Carousel Controls */}
                    <IconButton
                        onClick={prevSlide}
                        variant="soft"
                        color="neutral"
                        sx={{
                            position: 'absolute',
                            left: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: 'rgba(255,255,255,0.3)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.5)',
                            }
                        }}
                    >
                        <ArrowBackIosNewIcon />
                    </IconButton>

                    <IconButton
                        onClick={nextSlide}
                        variant="soft"
                        color="neutral"
                        sx={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: 'rgba(255,255,255,0.3)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.5)',
                            }
                        }}
                    >
                        <ArrowForwardIosIcon />
                    </IconButton>

                    {/* Carousel Indicators */}
                    <Box sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: 1,
                        zIndex: 2
                    }}>
                        {carouselItems.map((_, index) => (
                            <Box
                                key={index}
                                onClick={() => setActiveSlide(index)}
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: activeSlide === index ? 'primary.500' : 'rgba(255,255,255,0.5)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s'
                                }}
                            />
                        ))}
                    </Box>
                </Box>
            </Container>

            {/* Category Shortcuts */}
            <Container maxWidth="lg" sx={{ mb: 6 }}>
                <Grid container spacing={2}>
                    <Grid xs={6} sm={3}>
                        <Card variant="outlined" sx={{
                            height: '100%',
                            transition: 'transform 0.3s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 'md',
                                cursor: 'pointer'
                            }
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <NewReleasesIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography level="title-md" >New Arrivals</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid xs={6} sm={3}>
                        <Card variant="outlined" sx={{
                            height: '100%',
                            transition: 'transform 0.3s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 'md',
                                cursor: 'pointer'
                            }
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <LocalOfferIcon color="danger" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography level="title-md">Special Offers</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid xs={6} sm={3}>
                        <Card variant="outlined" sx={{
                            height: '100%',
                            transition: 'transform 0.3s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 'md',
                                cursor: 'pointer'
                            }
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <CategoryIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography level="title-md">Categories</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid xs={6} sm={3}>
                        <Card variant="outlined" sx={{
                            height: '100%',
                            transition: 'transform 0.3s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-5px)',
                                boxShadow: 'md',
                                cursor: 'pointer'
                            }
                        }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <TrendingUpIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography level="title-md">Trending</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Section Header */}
            <Container maxWidth="lg">
                <Sheet variant="soft" color="primary" sx={{
                    p: 2,
                    mb: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderRadius: 'md'
                }}>
                    <Typography level="h5" sx={{ fontWeight: 'bold' }}>Featured Products</Typography>
                    <Button component={Link} to="/store" variant="solid">View All</Button>
                </Sheet>

                {/* Error message */}
                {error && (
                    <Box sx={{ textAlign: 'center', my: 4, color: 'danger.500' }}>
                        <Typography level="body-lg">{error}</Typography>
                    </Box>
                )}

                {/* Products Grid */}
                <Grid container spacing={3} justifyContent="center">
                    {products.map((product, index) => {
                        if (products.length === index + 1) {
                            // This is the last element, attach the ref for infinite scroll
                            return (
                                <Grid key={product.id}>
                                    <Box ref={lastProductElementRef}>
                                        <ProductCard product={{
                                            ...product,
                                            // Map image_url to image property expected by ProductCard
                                            image: product.image_url
                                        }} />
                                    </Box>
                                </Grid>
                            );
                        } else {
                            return (
                                <Grid key={product.id}>
                                    <ProductCard product={{
                                        ...product,
                                        // Map image_url to image property expected by ProductCard
                                        image: product.image_url
                                    }} />
                                </Grid>
                            );
                        }
                    })}
                </Grid>

                {/* Loading indicator */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* No products message */}
                {!loading && products.length === 0 && (
                    <Box sx={{
                        textAlign: 'center',
                        my: 4,
                        p: 6,
                        bgcolor: darkMode ? 'neutral.800' : 'background.surface',
                        borderRadius: 'md',
                        border: '1px dashed',
                        borderColor: 'divider'
                    }}>
                        <Typography level="body-lg">No products available at the moment.</Typography>
                    </Box>
                )}
            </Container>

            {/* Back navigation prompt */}
            {showPrompt && (
                <Box sx={{
                    position: 'fixed',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(0,0,0,0.5)',
                    zIndex: 9999
                }}>
                    <Card variant="outlined" sx={{ maxWidth: 400, mx: 2 }}>
                        <CardContent>
                            <Typography level="title-md" sx={{ mb: 2 }}>
                                Are you sure you want to sign out?
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    color="neutral"
                                    onClick={handleCancelNavigation}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="solid"
                                    color="danger"
                                    onClick={handleSignOut}
                                >
                                    Sign Out
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Box>
    );
}
