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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Snackbar from '@mui/joy/Snackbar';
import Alert from '@mui/joy/Alert';
import { useTheme } from '../contexts/ThemeContext';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService';
import { addToCart } from '../services/cartService';
import { formatImageUrl, getPlaceholderImage } from '../utils/imageUtils';

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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);    // Extract product properties with defaults
    const {
        id = '',
        name = 'Product Name',
        category = 'Category',
        price = 0,
        currency = 'EG',
        rating = 0,
        stock = 0,
        discount = 0,
        isNewArrival = false
    } = product || {};

    // State for image carousel
    // const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Get all product images or fallback to placeholder
    const productImages = Array.isArray(product?.images) && product?.images.length > 0
        ? product.images
        : (product?.image_url ? [product.image_url] :
            (product?.image ? [product.image] : [getPlaceholderImage()]));

    // Current image to display based on carousel index
    const displayImage = productImages[currentImageIndex];

    // Carousel navigation handlers
    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => prev === 0 ? productImages.length - 1 : prev - 1);
    };

    // Calculate original price if there's a discount
    const originalPrice = discount > 0 ? (price / (1 - discount / 100)).toFixed(0) : null;    // Check if the product is in the user's wishlist on component mount and when wishlist changes
    useEffect(() => {
        const checkWishlistStatus = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) return;

                // Get the product ID in a consistent format
                const productId = id || product?._id || product?.id;
                if (!productId) return;

                // Check local storage first for quick display
                const wishlistCache = JSON.parse(localStorage.getItem('userWishlist') || '{"items":[]}');
                const cachedStatus = wishlistCache.items.includes(productId);
                setIsFavorited(cachedStatus);

                // Then fetch from server to be certain
                const response = await getWishlist(userId);
                if (response.data && response.data.data) {
                    // Loop through all items in the wishlist data
                    const isInWishlist = response.data.data.some(item => {
                        // Try different ID formats that might exist
                        const itemId = item._id || item.id || item.product_id;
                        const result = itemId && (itemId === productId ||
                            (itemId.toString && productId.toString &&
                                itemId.toString() === productId.toString()));
                        return result;
                    });

                    // Update state and cache if different from what we thought
                    if (isInWishlist !== cachedStatus) {
                        setIsFavorited(isInWishlist);
                        updateWishlistCache(productId, isInWishlist);
                    }
                }
            } catch (error) {
                console.error('Error checking wishlist status:', error);
            }
        };

        // Helper function to update wishlist cache
        const updateWishlistCache = (productId, isAdding) => {
            const wishlistCache = JSON.parse(localStorage.getItem('userWishlist') || '{"items":[]}');

            if (isAdding && !wishlistCache.items.includes(productId)) {
                wishlistCache.items.push(productId);
            } else if (!isAdding) {
                wishlistCache.items = wishlistCache.items.filter(id => id !== productId);
            }

            localStorage.setItem('userWishlist', JSON.stringify(wishlistCache));
        };

        if (id || product?._id || product?.id) {
            checkWishlistStatus();
        }

        // Listen for the wishlist update event
        window.addEventListener('wishlist-updated', checkWishlistStatus);

        return () => {
            window.removeEventListener('wishlist-updated', checkWishlistStatus);
        };
    }, [id, product]);

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

        if (productId && productId !== 'undefined') {
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
    };    // Helper function to update wishlist cache in localStorage
    const updateWishlistCache = (productId, isAdding) => {
        const wishlistCache = JSON.parse(localStorage.getItem('userWishlist') || '{"items":[]}');

        if (isAdding && !wishlistCache.items.includes(productId)) {
            wishlistCache.items.push(productId);
        } else if (!isAdding) {
            wishlistCache.items = wishlistCache.items.filter(id => id !== productId);
        }

        localStorage.setItem('userWishlist', JSON.stringify(wishlistCache));
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
            } if (isFavorited) {
                // Remove from wishlist
                await removeFromWishlist(userId, productId);
                showNotification('Removed from wishlist');
                setIsFavorited(false);

                // Update local cache
                updateWishlistCache(productId, false);
            } else {
                // Add to wishlist
                await addToWishlist(userId, productId);
                showNotification('Added to wishlist!');
                setIsFavorited(true);

                // Update local cache
                updateWishlistCache(productId, true);
            }

            // Dispatch event to update wishlist state across all components
            window.dispatchEvent(new CustomEvent('wishlist-updated', {
                detail: { productId, inWishlist: !isFavorited }
            }));
        } catch (error) {
            console.error('Error updating wishlist:', error);
            showNotification('Failed to update wishlist', 'error');
        }
    };

    // Change image handler
    const handleImageChange = (direction) => {
        if (!productImages || productImages.length <= 1) return;

        setCurrentImageIndex(prevIndex => {
            const newIndex = prevIndex + direction;
            // Loop the index within the bounds of the images array
            return (newIndex + productImages.length) % productImages.length;
        });
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

            {/* Product Card */}            <Card
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
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
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
                }}            >                <CardOverflow>
                    <AspectRatio ratio="1" className="product-image-container" sx={{ position: 'relative', height: 250, width: 250 }}>
                        {/* Image Carousel */}
                        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                            {productImages && productImages.length > 0 ? (
                                <img
                                    className="product-image"
                                    src={formatImageUrl(productImages[currentImageIndex])}
                                    alt={name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = getPlaceholderImage();
                                    }}
                                    style={{
                                        objectFit: 'cover',
                                        width: '100%',
                                        height: '100%',
                                        transition: 'transform 0.5s ease'
                                    }}
                                />
                            ) : (
                                <ImageNotSupportedIcon sx={{ width: '100%', height: '100%', color: 'neutral.500' }} />
                            )}

                            {/* Navigation buttons - only show if more than one image */}
                            {productImages && productImages.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleImageChange(-1);
                                        }}
                                        variant="soft"
                                        size="sm"
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: 8,
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 1)',
                                            }
                                        }}
                                    >
                                        <ArrowBackIosNewIcon />
                                    </IconButton>

                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleImageChange(1);
                                        }}
                                        variant="soft"
                                        size="sm"
                                        sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: 8,
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 1)',
                                            }
                                        }}
                                    >
                                        <ArrowForwardIosIcon />
                                    </IconButton>
                                </>
                            )}

                        </Box>

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
                    </AspectRatio>                </CardOverflow>

                <CardContent sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1,
                    height: '100%'
                }}>
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