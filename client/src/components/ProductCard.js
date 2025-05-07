// src/components/ProductCard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AspectRatio from '@mui/joy/AspectRatio';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import CardOverflow from '@mui/joy/CardOverflow';
import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import Box from '@mui/joy/Box';
import StarIcon from '@mui/icons-material/Star';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import Snackbar from '@mui/joy/Snackbar';
import Alert from '@mui/joy/Alert';
import { useTheme } from '../contexts/ThemeContext';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService';
import { addToCart } from '../services/cartService';
import { formatImageUrl } from '../utils/imageUtils';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [isFavorited, setIsFavorited] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        severity: 'success'
    });

    // Extract product properties with defaults
    const {
        id = '',
        name = 'Product Name',
        category = 'Category',
        price = 0,
        currency = 'EG',
        image = null,
        rating = 0,
        stock = 0,
        discount = 0,
        isNewArrival = false
    } = product || {};

    // Calculate original price if there's a discount
    const originalPrice = discount > 0 ? (price / (1 - discount / 100)).toFixed(0) : null;

    // Check if the product is in the user's wishlist on component mount
    useEffect(() => {
        const checkWishlistStatus = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) return;

                const response = await getWishlist(userId);

                if (response.data && response.data.data) {
                    // Check for both id and _id properties to support MongoDB ObjectIds
                    const isInWishlist = response.data.data.some(item =>
                        (item._id && (item._id === id || item._id.toString() === id.toString())) ||
                        (item.id && (item.id === id || item.id.toString() === id.toString()))
                    );
                    setIsFavorited(isInWishlist);
                }
            } catch (error) {
                console.error('Error checking wishlist status:', error);
            }
        };

        if (id) {
            checkWishlistStatus();
        }
    }, [id]);

    // Show notification function
    const showNotification = (message, severity = 'success') => {
        setNotification({
            show: true,
            message,
            severity
        });

        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // Render star ratings
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(<StarIcon key={i} sx={{ color: 'warning.500', fontSize: 16 }} />);
        }

        // Add half star if needed
        if (hasHalfStar) {
            stars.push(
                <span key="half" style={{ position: 'relative', display: 'inline-flex' }}>
                    <StarIcon sx={{ color: isDarkMode ? 'grey.700' : 'grey.300', fontSize: 16 }} />
                    <StarIcon
                        sx={{
                            position: 'absolute',
                            color: 'warning.500',
                            clipPath: 'inset(0 50% 0 0)',
                            fontSize: 16
                        }}
                    />
                </span>
            );
        }

        // Add empty stars
        const emptyStars = 5 - (fullStars + (hasHalfStar ? 1 : 0));
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <StarIcon
                    key={`empty-${i}`}
                    sx={{ color: isDarkMode ? 'grey.700' : 'grey.300', fontSize: 16 }}
                />
            );
        }

        return stars;
    };

    // Navigate to product details page
    const handleCardClick = () => {
        // Use the first valid ID format we find
        const productId = id || product?._id || product?.id;

        if (productId) {
            navigate(`/item/${productId}`);
        } else {
            console.error('Product ID missing or undefined', product);
            showNotification('Error accessing product details', 'error');
        }
    };

    // Handle adding product to cart
    const handleAddToCart = async (e) => {
        e.stopPropagation(); // Prevent navigating to item page when clicking the button

        try {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (!userId || !token) {
                showNotification('Please sign in to add items to your cart', 'warning');
                navigate('/signin', { state: { returnTo: `/item/${id}` } });
                return;
            }

            // Make sure we have a valid product ID
            const productId = id || product._id || product.id;

            if (!productId) {
                console.error('Product ID is missing');
                showNotification('Error: Could not identify product', 'error');
                return;
            }

            await addToCart({
                userId,
                productId,
                quantity: 1
            });

            showNotification('Added to cart successfully!');

            // Dispatch event to update cart count in navbar
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (error) {
            console.error('Error adding to cart:', error);

            if (error.response) {
                if (error.response.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('isAdmin');

                    showNotification('Your session has expired. Please sign in again.', 'warning');
                    navigate('/signin');
                } else {
                    showNotification('Failed to add to cart', 'error');
                }
            } else {
                showNotification('Failed to add to cart', 'error');
            }
        }
    };

    // Toggle wishlist status
    const toggleFavorite = async (e) => {
        e.stopPropagation(); // Prevent navigating to item page when clicking the button

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                showNotification('Please sign in to add items to your wishlist', 'warning');
                navigate('/signin', { state: { returnTo: `/item/${id}` } });
                return;
            }

            // Make sure we have a valid product ID
            const productId = id || product._id || product.id;

            if (!productId) {
                console.error('Product ID is missing');
                showNotification('Error: Could not identify product', 'error');
                return;
            }

            if (isFavorited) {
                // Remove from wishlist
                await removeFromWishlist(userId, productId);
                showNotification('Removed from wishlist');
            } else {
                // Add to wishlist
                await addToWishlist(userId, productId);
                showNotification('Added to wishlist!');
            }

            // Toggle the state
            setIsFavorited(!isFavorited);
        } catch (error) {
            console.error('Error updating wishlist:', error);
            showNotification('Failed to update wishlist', 'error');
        }
    };

    return (
        <>
            {/* Notification */}
            {notification.show && (
                <Snackbar
                    open={notification.show}
                    autoHideDuration={3000}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        color={notification.severity}
                        variant="soft"
                        size="sm"
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            )}

            {/* Product Card */}
            <Card
                onClick={handleCardClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{
                    width: '100%',
                    maxWidth: '100%',
                    position: 'relative',
                    boxShadow: 'sm',
                    borderRadius: 'xl',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 'lg',
                        '& .product-actions': {
                            opacity: 1,
                            transform: 'translateY(0)',
                        },
                        '& .product-image': {
                            transform: 'scale(1.05)',
                        }
                    },
                    bgcolor: isDarkMode ? 'neutral.900' : 'background.surface',
                }}
            >
                <CardOverflow>
                    <AspectRatio ratio="1" className="product-image-container" sx={{ position: 'relative' }}>
                        {image ? (
                            <img
                                className="product-image"
                                src={formatImageUrl(image)}
                                alt={name}
                                style={{
                                    objectFit: 'cover',
                                    transition: 'transform 0.5s ease'
                                }}
                            />
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    bgcolor: isDarkMode ? 'neutral.800' : 'neutral.100',
                                    color: isDarkMode ? 'neutral.400' : 'neutral.500'
                                }}
                            >
                                <ImageNotSupportedIcon sx={{ fontSize: 48, mb: 1 }} />
                                <Typography level="body-sm">No Image Available</Typography>
                            </Box>
                        )}

                        {/* Product badges */}
                        <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {isNewArrival && (
                                <Chip
                                    size="sm"
                                    variant="soft"
                                    color="primary"
                                    sx={{
                                        fontWeight: 'bold',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    NEW
                                </Chip>
                            )}
                        </Box>

                        {discount > 0 && (
                            <Chip
                                size="sm"
                                variant="solid"
                                color="danger"
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    fontWeight: 'bold',
                                }}
                            >
                                -{discount}% OFF
                            </Chip>
                        )}

                        {/* Wishlist button - always visible in top right */}
                        <IconButton
                            onClick={toggleFavorite}
                            variant="soft"
                            color={isFavorited ? "danger" : "neutral"}
                            size="sm"
                            sx={{
                                position: 'absolute',
                                top: discount > 0 ? 48 : 8,
                                right: 8,
                                backdropFilter: 'blur(8px)',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            {isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>

                        {/* Quick action buttons */}
                        <Box
                            className="product-actions"
                            sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 1,
                                opacity: 0,
                                transform: 'translateY(20px)',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            <Button
                                variant="soft"
                                color="primary"
                                size="sm"
                                startDecorator={<ShoppingCartIcon />}
                                onClick={handleAddToCart}
                                sx={{ backdropFilter: 'blur(8px)' }}
                                disabled={stock <= 0}
                            >
                                {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                            </Button>
                        </Box>
                    </AspectRatio>
                </CardOverflow>

                <CardContent>
                    <Box sx={{ mb: 1 }}>
                        <Typography level="body-xs" textColor={isDarkMode ? 'neutral.400' : 'neutral.600'}>
                            {category}
                        </Typography>
                    </Box>

                    <Typography
                        level="title-md"
                        sx={{
                            fontWeight: 'bold',
                            mb: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '2.5rem',
                        }}
                    >
                        {name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', mr: 1 }}>
                            {renderStars(rating)}
                        </Box>
                        <Typography level="body-sm" textColor={isDarkMode ? 'neutral.400' : 'neutral.600'}>
                            ({rating.toFixed(1)})
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap'
                    }}>
                        <Box>
                            <Typography
                                level="title-lg"
                                sx={{ fontWeight: 'xl', color: discount > 0 ? 'danger.500' : 'inherit' }}
                            >
                                {price.toLocaleString()} {currency}
                            </Typography>

                            {originalPrice && (
                                <Typography
                                    level="body-sm"
                                    sx={{ textDecoration: 'line-through', color: 'neutral.500' }}
                                >
                                    {originalPrice.toLocaleString()} {currency}
                                </Typography>
                            )}
                        </Box>

                        <Typography
                            level="body-sm"
                            sx={{
                                color: stock <= 0 ? 'danger.500' : (stock < 10 ? 'warning.500' : 'success.500'),
                                fontWeight: 'md'
                            }}
                        >
                            {stock <= 0 ? 'Out of Stock' : (stock < 10 ? `Only ${stock} left!` : 'In Stock')}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </>
    );
}
