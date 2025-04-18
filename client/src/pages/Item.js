// src/pages/Item.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Grid,
    Container,
    Typography,
    Button,
    Divider,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    List,
    ListItem,
    Avatar,
    IconButton,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    FormLabel,
    RadioGroup,
    Radio,
    Sheet,
    Input,
    Chip
} from '@mui/joy';
import {
    Star as StarIcon,
    ShoppingCart as CartIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Add as AddIcon,
    Remove as RemoveIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { addToCart } from '../services/cartService'; // Fixed import path

// Mock data for the product - In real app, fetch this from API
const mockProduct = {
    id: '1',
    name: 'Super Rockez A400 Bluetooth Headphones',
    description: 'Experience unparalleled sound quality with these premium wireless headphones. Featuring active noise cancellation, 40-hour battery life, and comfortable over-ear design.',
    price: 2900,
    currency: 'THB',
    discount: 15,
    rating: 4.5,
    reviewCount: 124,
    images: [
        'https://images.unsplash.com/photo-1593121925328-369cc8459c08?auto=format&fit=crop&w=500',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500',
        'https://images.unsplash.com/photo-1600086827875-a63b01f1335c?auto=format&fit=crop&w=500'
    ],
    colors: [
        { name: 'Black', value: '#000000' },
        { name: 'White', value: '#FFFFFF' },
        { name: 'Blue', value: '#0000FF' }
    ],
    sizes: ['S', 'M', 'L'],
    stock: 7,
    specs: {
        'Bluetooth Version': '5.0',
        'Battery Life': '40 hours',
        'Charging Time': '2 hours',
        'Noise Cancellation': 'Active',
        'Microphone': 'Built-in with voice assistant support'
    },
    publisher: {
        name: 'AudioTech Inc.',
        logo: 'https://images.unsplash.com/photo-1560800452-f2d475982b96?auto=format&fit=crop&w=100',
        rating: 4.8,
        productCount: 32,
        since: '2015'
    },
    reviews: [
        {
            id: 1,
            user: {
                name: 'Sarah Johnson',
                avatar: 'https://i.pravatar.cc/150?img=1'
            },
            rating: 5,
            date: '2023-09-15',
            comment: 'These are the best headphones I\'ve ever owned! The sound quality is amazing and the noise cancellation works great on airplanes.'
        },
        {
            id: 2,
            user: {
                name: 'Michael Chen',
                avatar: 'https://i.pravatar.cc/150?img=2'
            },
            rating: 4,
            date: '2023-08-30',
            comment: 'Really comfortable for long listening sessions. Battery life is impressive, but the app could be better.'
        },
        {
            id: 3,
            user: {
                name: 'Jessica Lee',
                avatar: 'https://i.pravatar.cc/150?img=3'
            },
            rating: 5,
            date: '2023-07-22',
            comment: 'Sound quality exceeded my expectations. The bass response is perfect, and they look stylish too!'
        }
    ]
};

const Item = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useTheme();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('');

    // Fetch product data
    useEffect(() => {
        // Simulate API call with timeout
        const fetchProduct = async () => {
            try {
                // In a real app, fetch from API: await api.get(`/products/${id}`)
                setTimeout(() => {
                    setProduct(mockProduct);
                    setLoading(false);
                }, 700);
            } catch (error) {
                console.error('Failed to fetch product:', error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleColorChange = (index) => {
        setSelectedColor(index);
    };

    const handleSizeChange = (event) => {
        setSelectedSize(event.target.value);
    };

    const increaseQuantity = () => {
        if (quantity < product?.stock) {
            setQuantity(quantity + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                console.log('User not authenticated, redirecting to signin');
                // Show sign in notification
                navigate('/signin', { state: { from: location.pathname } });
                return;
            }

            // Add a console log to debug the token
            console.log('Adding to cart with token:', token ? 'Token exists' : 'No token');

            await addToCart({
                userId,
                productId: product.id,
                quantity,
                // You could include size, color or other variants here
                size: selectedSize,
                color: product.colors[selectedColor]?.name
            });

            // Show success notification
            setSnackbarOpen(true);
            setSnackbarMessage('Successfully added to cart!');
            setSnackbarSeverity('success');

            // Dispatch event to update cart count
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (error) {
            console.error('Error adding to cart:', error);

            // Check for specific error types
            if (error.response) {
                console.log('Error response:', error.response.status, error.response.data);

                if (error.response.status === 401) {
                    // If token expired or invalid, clear local storage and redirect to signin
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('isAdmin');
                    navigate('/signin', { state: { from: location.pathname } });

                    // Show error notification
                    setSnackbarOpen(true);
                    setSnackbarMessage('Your session has expired. Please sign in again.');
                    setSnackbarSeverity('warning');
                } else {
                    setSnackbarOpen(true);
                    setSnackbarMessage('Failed to add item to cart. Please try again.');
                    setSnackbarSeverity('error');
                }
            } else {
                setSnackbarOpen(true);
                setSnackbarMessage('Failed to add item to cart. Please try again.');
                setSnackbarSeverity('error');
            }
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<StarIcon key={i} sx={{ color: 'warning.500' }} />);
        }

        if (hasHalfStar) {
            stars.push(
                <span key="half" style={{ position: 'relative', display: 'inline-flex' }}>
                    <StarIcon sx={{ color: isDarkMode ? 'grey.700' : 'grey.300' }} />
                    <StarIcon
                        sx={{
                            position: 'absolute',
                            color: 'warning.500',
                            clipPath: 'inset(0 50% 0 0)'
                        }}
                    />
                </span>
            );
        }

        const emptyStars = 5 - stars.length;
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<StarIcon key={`empty-${i}`} sx={{ color: isDarkMode ? 'grey.700' : 'grey.300' }} />);
        }

        return stars;
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80vh'
                }}
            >
                <CircularProgress size="lg" />
            </Box>
        );
    }

    if (!product) {
        return (
            <Container sx={{ py: 6 }}>
                <Typography level="h3">Product not found</Typography>
            </Container>
        );
    }

    const originalPrice = product.discount > 0
        ? (product.price / (1 - product.discount / 100)).toFixed(0)
        : null;

    return (
        <Container sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Product Images */}
                <Grid xs={12} md={6}>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                        <Box
                            component="img"
                            src={product.images[selectedImage]}
                            alt={product.name}
                            sx={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 'md',
                                objectFit: 'cover',
                                aspectRatio: '1/1',
                                boxShadow: 'sm'
                            }}
                        />
                        <IconButton
                            variant="soft"
                            color={isFavorite ? 'danger' : 'neutral'}
                            aria-label="Add to favorites"
                            size="md"
                            onClick={toggleFavorite}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                zIndex: 2,
                            }}
                        >
                            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {product.images.map((image, index) => (
                            <Box
                                key={index}
                                component="img"
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                onClick={() => setSelectedImage(index)}
                                sx={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: 'sm',
                                    cursor: 'pointer',
                                    border: selectedImage === index ? '2px solid' : '2px solid transparent',
                                    borderColor: 'primary.500',
                                    boxShadow: selectedImage === index ? 'md' : 'sm',
                                    transition: 'all 0.2s',
                                    opacity: selectedImage === index ? 1 : 0.7,
                                    '&:hover': {
                                        opacity: 1
                                    }
                                }}
                            />
                        ))}
                    </Box>
                </Grid>

                {/* Product Info */}
                <Grid xs={12} md={6}>
                    <Typography level="h2" fontWeight="bold" sx={{ mb: 1 }}>
                        {product.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', mr: 1 }}>
                            {renderStars(product.rating)}
                        </Box>
                        <Typography level="body-md" component="span" sx={{ mr: 2 }}>
                            {product.rating} ({product.reviewCount} reviews)
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                        <Typography
                            level="h3"
                            fontWeight="bold"
                            color="primary"
                            sx={{ mr: 2 }}
                        >
                            {product.price.toLocaleString()} {product.currency}
                        </Typography>

                        {originalPrice && (
                            <Typography
                                level="body-lg"
                                sx={{
                                    textDecoration: 'line-through',
                                    color: 'neutral.500',
                                    mr: 2
                                }}
                            >
                                {originalPrice.toLocaleString()} {product.currency}
                            </Typography>
                        )}

                        {product.discount > 0 && (
                            <Chip
                                color="danger"
                                size="sm"
                                variant="soft"
                            >
                                {product.discount}% OFF
                            </Chip>
                        )}
                    </Box>

                    <Typography level="body-md" sx={{ mb: 3 }}>
                        {product.description}
                    </Typography>

                    {/* Publisher info */}
                    <Sheet
                        variant="outlined"
                        sx={{
                            p: 2,
                            mb: 3,
                            borderRadius: 'md',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <Avatar
                            src={product.publisher.logo}
                            alt={product.publisher.name}
                            size="lg"
                            sx={{ mr: 2 }}
                        />
                        <Box>
                            <Typography level="title-sm">Sold by</Typography>
                            <Typography level="title-md" fontWeight="bold">
                                {product.publisher.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <StarIcon sx={{ color: 'warning.500', fontSize: 'sm', mr: 0.5 }} />
                                <Typography level="body-sm">
                                    {product.publisher.rating} · {product.publisher.productCount} products · Since {product.publisher.since}
                                </Typography>
                            </Box>
                        </Box>
                    </Sheet>

                    <Divider sx={{ my: 2 }} />

                    {/* Color Selection */}
                    <Box sx={{ mb: 3 }}>
                        <Typography level="title-sm" sx={{ mb: 1 }}>
                            Color: {product.colors[selectedColor].name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {product.colors.map((color, index) => (
                                <Box
                                    key={index}
                                    onClick={() => handleColorChange(index)}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        bgcolor: color.value,
                                        cursor: 'pointer',
                                        border: '2px solid',
                                        borderColor: selectedColor === index ? 'primary.500' : 'transparent',
                                        outline: color.value === '#FFFFFF' ? '1px solid' : 'none',
                                        outlineColor: 'divider',
                                        position: 'relative',
                                        transition: 'transform 0.2s',
                                        '&:hover': {
                                            transform: 'scale(1.1)'
                                        }
                                    }}
                                >
                                    {selectedColor === index && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                border: '2px solid white',
                                                top: 0,
                                                left: 0
                                            }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Size Selection */}
                    <FormControl sx={{ mb: 3 }}>
                        <FormLabel>Size</FormLabel>
                        <RadioGroup
                            row
                            value={selectedSize}
                            onChange={handleSizeChange}
                        >
                            {product.sizes.map((size) => (
                                <Radio
                                    key={size}
                                    value={size}
                                    label={size}
                                    overlay
                                    disableIcon
                                    variant="outlined"
                                    sx={{
                                        mb: 1,
                                        mr: 1,
                                        p: 2,
                                        minWidth: 48,
                                        fontWeight: 'md',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        '&:hover': {
                                            bgcolor: 'primary.softHover'
                                        }
                                    }}
                                    slotProps={{
                                        action: ({ checked }) => ({
                                            sx: {
                                                fontWeight: 'lg',
                                                borderWidth: 2,
                                                borderColor: checked ? 'primary.500' : 'neutral.outlinedBorder',
                                            },
                                        }),
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    {/* Quantity Selection */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <FormLabel sx={{ mr: 2 }}>Quantity:</FormLabel>
                        <Sheet
                            variant="outlined"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: 'md'
                            }}
                        >
                            <IconButton
                                size="md"
                                variant="plain"
                                onClick={decreaseQuantity}
                                disabled={quantity <= 1}
                            >
                                <RemoveIcon />
                            </IconButton>
                            <Input
                                value={quantity}
                                sx={{
                                    width: 48,
                                    textAlign: 'center',
                                    '& input': { textAlign: 'center' },
                                    border: 'none',
                                    '&:focus-within': {
                                        outline: 'none',
                                    }
                                }}
                                slotProps={{
                                    input: {
                                        component: 'input',
                                        min: 1,
                                        max: product.stock,
                                        sx: { textAlign: 'center' }
                                    }
                                }}
                                readOnly
                            />
                            <IconButton
                                size="md"
                                variant="plain"
                                onClick={increaseQuantity}
                                disabled={quantity >= product.stock}
                            >
                                <AddIcon />
                            </IconButton>
                        </Sheet>
                        <Typography level="body-sm" color="warning" sx={{ ml: 2 }}>
                            {product.stock < 10 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
                        </Typography>
                    </Box>

                    {/* Add to Cart Button */}
                    <Button
                        fullWidth
                        size="lg"
                        color="primary"
                        variant="solid"
                        startDecorator={<CartIcon />}
                        onClick={handleAddToCart}
                        sx={{ mb: 2 }}
                        disabled={!selectedSize || quantity <= 0}
                    >
                        Add to Cart
                    </Button>
                </Grid>
            </Grid>

            {/* Product Details, Reviews & Specifications */}
            <Box sx={{ mt: 6 }}>
                <Tabs
                    value={activeTab}
                    onChange={(event, value) => setActiveTab(value)}
                    aria-label="Product information tabs"
                    sx={{ borderRadius: 'md' }}
                >
                    <TabList
                        sx={{
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            p: 0,
                        }}
                    >
                        <Tab>Description</Tab>
                        <Tab>Specifications</Tab>
                        <Tab>Reviews ({product.reviews.length})</Tab>
                    </TabList>
                    <TabPanel value={0} sx={{ p: 3 }}>
                        <Typography level="body-lg">{product.description}</Typography>
                    </TabPanel>
                    <TabPanel value={1} sx={{ p: 3 }}>
                        <List>
                            {Object.entries(product.specs).map(([key, value], index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        backgroundColor: index % 2 === 0 ? 'background.surface' : 'transparent',
                                        borderRadius: 'sm',
                                        py: 1.5
                                    }}
                                >
                                    <Typography level="title-sm">{key}</Typography>
                                    <Typography level="body-md">{value}</Typography>
                                </ListItem>
                            ))}
                        </List>
                    </TabPanel>
                    <TabPanel value={2} sx={{ p: 3 }}>
                        {product.reviews.map((review) => (
                            <Card key={review.id} variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                src={review.user.avatar}
                                                alt={review.user.name}
                                                size="sm"
                                                sx={{ mr: 1.5 }}
                                            />
                                            <Box>
                                                <Typography level="title-sm">{review.user.name}</Typography>
                                                <Typography level="body-xs" color="neutral">{review.date}</Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex' }}>
                                            {[...Array(review.rating)].map((_, i) => (
                                                <StarIcon key={i} sx={{ color: 'warning.500', fontSize: 'md' }} />
                                            ))}
                                        </Box>
                                    </Box>
                                    <Typography level="body-md">{review.comment}</Typography>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Review Form Placeholder */}
                        <Card variant="outlined" sx={{ mt: 4 }}>
                            <CardContent>
                                <Typography level="title-md" sx={{ mb: 2 }}>Write a Review</Typography>
                                <Typography level="body-sm" sx={{ mb: 2 }}>You need to be logged in to write a review.</Typography>
                                <Button variant="outlined" color="primary">Sign in to write a review</Button>
                            </CardContent>
                        </Card>
                    </TabPanel>
                </Tabs>
            </Box>
        </Container>
    );
};

export default Item;