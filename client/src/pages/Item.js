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
    Chip,
    Alert,
    Textarea
} from '@mui/joy';
import { Rating } from '@mui/material';
import {
    Star as StarIcon,
    ShoppingCart as CartIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    Add as AddIcon,
    Remove as RemoveIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { addToCart } from '../services/cartService';
import { getProductById } from '../services/productService';
import { addReview, getReviews } from '../services/reviewService';
import { formatImageUrl } from '../utils/imageUtils';
import { getWishlist, addToWishlist, removeFromWishlist } from '../services/wishlistService';
import ProductImageCarousel from '../components/ProductImageCarousel';

const Item = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { darkMode } = useTheme();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedColor, setSelectedColor] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('');

    // Review states
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: ''
    });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    // Fetch product data on component mount
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                // console.log("Fetching product with ID:", id);
                const response = await getProductById(id);
                // console.log("Product API response:", response);

                if (response && response.data) {
                    // Initialize product data, ensuring images is an array
                    let productData;

                    // Handle different response structures
                    if (response.data.data) {
                        productData = response.data.data;
                        // console.log("Found product in response.data.data");
                    } else {
                        productData = response.data;
                        // console.log("Found product in response.data");
                    }                    // Ensure product has an images array - handle single image case
                    if (!Array.isArray(productData.images) || productData.images.length === 0) {
                        productData.images = productData.image_url ? [productData.image_url] :
                            (productData.image ? [productData.image] : []);
                    }

                    // console.log("Processed product data:", productData);
                    setProduct(productData);

                    // Check if user is logged in to enable review submission
                    const userId = localStorage.getItem('userId');
                    setIsUserLoggedIn(!!userId);

                    // Check if this item is in the user's wishlist
                    if (userId) {
                        try {
                            const wishlistResponse = await getWishlist(userId);
                            if (wishlistResponse && wishlistResponse.data) {
                                const wishlistItems = Array.isArray(wishlistResponse.data) ?
                                    wishlistResponse.data :
                                    (wishlistResponse.data.data || []);

                                // Check if current product is in wishlist using multiple potential ID fields
                                const isInWishlist = wishlistItems.some(
                                    item =>
                                        (item.id === productData.id) ||
                                        (item._id === productData._id) ||
                                        (item.product_id === productData.id) ||
                                        (item.product_id === productData._id) ||
                                        (item.product && (item.product._id === productData._id || item.product.id === productData.id))
                                );
                                setIsFavorite(isInWishlist);
                            }
                        } catch (wishlistError) {
                            console.error('Error checking wishlist status:', wishlistError);
                        }
                    }

                    // Fetch reviews for the product
                    fetchReviews(id);
                } else {
                    console.error("Invalid product response format:", response);
                    setError('Product information not available');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                if (error.response) {
                    console.error('Server response error:', error.response.status, error.response.data);
                }
                setError('Failed to load product details. The product may not exist or has been removed.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        } else {
            setError('Invalid product ID');
            setLoading(false);
        }
    }, [id]);

    // Check for reviews tab in URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('tab') === 'reviews') {
            // If product has specs, reviews is tab 2, otherwise it's tab 1
            setActiveTab(product && product.specs && Object.keys(product.specs).length > 0 ? 2 : 1);
        }
    }, [location.search, product]);

    // Function to fetch product reviews
    const fetchReviews = async (productId) => {
        try {
            setReviewsLoading(true);
            const response = await getReviews(productId);

            if (response.data && response.data.data) {
                setReviews(response.data.data);
                // console.log("Reviews loaded:", response.data.data.length, "reviews found");
            } else {
                // console.log("No reviews found in response");
                setReviews([]);
            }
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            // Don't show an error message, just keep reviews empty
            setReviews([]);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Handle review input change
    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setNewReview({
            ...newReview,
            [name]: value
        });
    };

    // Handle rating change
    const handleRatingChange = (event, newValue) => {
        setNewReview({
            ...newReview,
            rating: newValue
        });
    };

    // Handle review submission
    const handleSubmitReview = async (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId');
        if (!userId) {
            // Show notification to log in
            setSnackbarOpen(true);
            setSnackbarMessage('Please sign in to submit a review');
            setSnackbarSeverity('warning');
            navigate('/signin', { state: { from: location.pathname } });
            return;
        }

        if (!newReview.comment.trim()) {
            setSnackbarOpen(true);
            setSnackbarMessage('Please write a comment for your review');
            setSnackbarSeverity('warning');
            return;
        }

        try {
            setIsSubmittingReview(true);

            const reviewData = {
                productId: id,
                userId: userId,
                rating: newReview.rating,
                comment: newReview.comment
            };

            await addReview(id, reviewData);

            // Reset the form
            setNewReview({
                rating: 5,
                comment: ''
            });

            // Show success message
            setSnackbarOpen(true);
            setSnackbarMessage('Your review has been submitted successfully!');
            setSnackbarSeverity('success');

            // Refresh reviews
            fetchReviews(id);
        } catch (error) {
            console.error('Failed to submit review:', error);
            let errorMessage = 'Failed to submit your review. Please try again.';

            if (error.response && error.response.status === 409) {
                errorMessage = 'You have already reviewed this product';
            }

            setSnackbarOpen(true);
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleColorChange = (index) => {
        setSelectedColor(index);
    };

    const handleSizeChange = (size) => {
        setSelectedSize(size);
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

    const toggleFavorite = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            // User is not logged in, navigate to sign in
            setSnackbarOpen(true);
            setSnackbarMessage('Please sign in to manage your wishlist');
            setSnackbarSeverity('warning');
            navigate('/signin', { state: { from: location.pathname } });
            return;
        }

        try {
            setIsFavorite(!isFavorite);

            if (isFavorite) {
                // Remove from wishlist - explicitly passing userId first, productId second
                await removeFromWishlist(userId, product._id || product.id);
                setSnackbarMessage('Removed from your wishlist');
            } else {
                // Add to wishlist - explicitly passing userId first, productId second
                await addToWishlist(userId, product._id || product.id);
                setSnackbarMessage('Added to your wishlist');
            }

            // Refresh wishlist status
            const updatedWishlist = await getWishlist(userId);
            // Check if the product is in the updated wishlist
            const isInWishlist = updatedWishlist.data.some(item =>
                (item.product_id === (product._id || product.id)) ||
                (item._id === (product._id || product.id)) ||
                (item.product && (item.product._id === (product._id || product.id)))
            );
            setIsFavorite(isInWishlist);            // Show success message
            setSnackbarOpen(true);
            setSnackbarSeverity('success');
            
            // Dispatch event to update wishlist state across all components
            window.dispatchEvent(new CustomEvent('wishlist-updated'));
        } catch (error) {
            console.error('Error updating wishlist:', error);
            setSnackbarOpen(true);
            setSnackbarMessage('Failed to update wishlist. Please try again.');
            setSnackbarSeverity('error');
        }
    };

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            if (!token || !userId) {
                // console.log('User not authenticated, redirecting to signin');
                navigate('/signin', { state: { from: location.pathname } });
                return;
            }

            // Add to cart with selected variants
            const selectedColorName = product.colors && product.colors.length > 0
                ? product.colors[selectedColor]?.name
                : null;

            await addToCart({
                userId,
                productId: product._id || product.id,
                quantity,
                size: selectedSize,
                color: selectedColorName
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
                // console.log('Error response:', error.response.status, error.response.data);

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
        const hasHalfStar = rating % 1 >= 0.5;

        // Add full stars
        for (let i = 0; i < fullStars; i++) {
            stars.push(<StarIcon key={i} sx={{ color: 'warning.500' }} />);
        }

        // Add half star if needed
        if (hasHalfStar) {
            stars.push(
                <span key="half" style={{ position: 'relative', display: 'inline-flex' }}>
                    <StarIcon sx={{ color: darkMode ? 'grey.700' : 'grey.300' }} />
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

        // Add empty stars
        const emptyStars = 5 - (fullStars + (hasHalfStar ? 1 : 0));
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<StarIcon key={`empty-${i}`} sx={{ color: darkMode ? 'grey.700' : 'grey.300' }} />);
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

    if (error || !product) {
        return (
            <Container sx={{ py: 6 }}>
                <Alert color="danger" sx={{ mb: 4 }}>
                    {error || "Product not found"}
                </Alert>
                <Button
                    onClick={() => navigate('/store')}
                    variant="outlined"
                >
                    Return to Store
                </Button>
            </Container>
        );
    }

    const originalPrice = product.discount > 0
        ? (product.price / (1 - product.discount / 100)).toFixed(0)
        : null;

    // Check if product has colors and sizes
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;

    return (
        <Container sx={{ py: 4 }}>
            <Grid container spacing={4}>
                {/* Product Images */}
                <Grid xs={12} md={6}>
                    <ProductImageCarousel
                        images={product.images}
                        selectedImage={selectedImage}
                        setSelectedImage={setSelectedImage}
                        isFavorite={isFavorite}
                        toggleFavorite={toggleFavorite}
                    />
                </Grid>

                {/* Product Info */}
                <Grid xs={12} md={6}>
                    <Typography level="h2" fontWeight="bold" sx={{ mb: 1, color: darkMode ? 'primary.300' : 'neutral.800' }}>
                        {product.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ display: 'flex', mr: 1 }}>
                            {renderStars(product.rating || 0)}
                        </Box>
                        <Typography level="body-md" component="span" sx={{ mr: 2, color: darkMode ? 'primary.300' : 'neutral.800' }}>
                            {product.rating || 0} ({product.review_count || 0} reviews)
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                        <Typography
                            level="h3"
                            fontWeight="bold"
                            color="primary"
                            sx={{ mr: 2 }}
                        >
                            {product.price.toLocaleString()} {product.currency || 'EGP'}
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
                                {originalPrice.toLocaleString()} {product.currency || 'EGP'}
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

                    <Divider sx={{ my: 2 }} />

                    {/* Color Selection - Only show if product has colors */}
                    {hasColors && (
                        <Box sx={{ mb: 3 }}>
                            <Typography level="title-sm" sx={{ mb: 1, color: darkMode ? 'primary.300' : 'neutral.800' }}>
                                Color: {product.colors[selectedColor]?.name}
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
                    )}

                    {/* Size Selection - Only show if product has sizes */}
                    {hasSizes && (
                        <FormControl sx={{ mb: 3, width: '100%' }}>
                            <FormLabel id="size-selection-label">Size</FormLabel>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1 }}>
                                {product.sizes.map((size) => (
                                    <Sheet
                                        key={size}
                                        variant={selectedSize === size ? "solid" : "outlined"}
                                        color={selectedSize === size ? "primary" : "neutral"}
                                        onClick={() => handleSizeChange(size)}
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 'md',
                                            fontSize: '1.1rem',
                                            fontWeight: selectedSize === size ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            position: 'relative',
                                            boxShadow: selectedSize === size ? 'sm' : 'none',
                                            '&:hover': {
                                                bgcolor: selectedSize === size ?
                                                    'primary.softHover' :
                                                    darkMode ? 'neutral.700' : 'neutral.100'
                                            },
                                            '&:active': {
                                                transform: 'scale(0.95)'
                                            }
                                        }}
                                    >
                                        {size}
                                        {selectedSize === size && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: 'primary.500',
                                                    bottom: 6,
                                                }}
                                            />
                                        )}
                                    </Sheet>
                                ))}
                            </Box>
                            {hasSizes && !selectedSize && (
                                <Typography level="body-xs" color="danger" sx={{ mt: 1, color: darkMode ? 'primary.300' : 'neutral.800' }}>
                                    Please select a size
                                </Typography>
                            )}
                        </FormControl>
                    )}

                    {/* Quantity Selection */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <FormLabel sx={{ mr: 2, color: darkMode ? 'primary.300' : 'neutral.800' }}>Quantity:</FormLabel>
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
                        disabled={(hasSizes && !selectedSize) || quantity <= 0 || product.stock <= 0}
                    >
                        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
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
                        {product.specs && Object.keys(product.specs).length > 0 && (
                            <Tab>Specifications</Tab>
                        )}
                        <Tab>Reviews</Tab>
                    </TabList>
                    <TabPanel value={0} sx={{ p: 3 }}>
                        <Typography level="body-lg">{product.description}</Typography>
                    </TabPanel>

                    {product.specs && Object.keys(product.specs).length > 0 && (
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
                    )}

                    <TabPanel value={product.specs && Object.keys(product.specs).length > 0 ? 2 : 1} sx={{ p: 3 }}>
                        {/* Show loading indicator while fetching reviews */}
                        {reviewsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {/* Reviews list */}
                                {reviews && reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <Card key={review.id} variant="outlined" sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Avatar
                                                            alt={review.user_name || "User"}
                                                            size="sm"
                                                            sx={{ mr: 1.5 }}
                                                        >
                                                            {(review.user_name || "U")[0]}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography level="title-sm">{review.user_name || "Anonymous User"}</Typography>
                                                            <Typography level="body-xs" color="neutral">
                                                                {new Date(review.created_at).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex' }}>
                                                        {renderStars(review.rating)}
                                                    </Box>
                                                </Box>
                                                <Typography level="body-md">{review.comment}</Typography>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography level="body-lg" sx={{ mb: 2 }}>No reviews yet</Typography>
                                        <Typography level="body-sm" sx={{ color: 'neutral.500', mb: 3 }}>
                                            Be the first to share your experience with this product
                                        </Typography>
                                    </Box>
                                )}

                                {/* Review Form - Show only if user is logged in */}
                                <Card variant="outlined" sx={{ mt: 4 }}>
                                    <CardContent>
                                        <Typography level="title-md" sx={{ mb: 2 }}>Write a Review</Typography>

                                        {isUserLoggedIn ? (
                                            <form onSubmit={handleSubmitReview}>
                                                <FormControl id="review-rating" sx={{ mb: 2 }}>
                                                    <FormLabel>Rating</FormLabel>
                                                    <Rating
                                                        name="rating"
                                                        value={newReview.rating}
                                                        onChange={handleRatingChange}
                                                        precision={1}
                                                    />
                                                </FormControl>

                                                <FormControl id="review-comment" sx={{ mb: 3 }}>
                                                    <FormLabel>Your Review</FormLabel>
                                                    <Textarea
                                                        name="comment"
                                                        placeholder="Share your experience with this product..."
                                                        minRows={3}
                                                        value={newReview.comment}
                                                        onChange={handleReviewChange}
                                                        required
                                                    />
                                                </FormControl>

                                                <Button
                                                    type="submit"
                                                    color="primary"
                                                    loading={isSubmittingReview}
                                                    disabled={!newReview.comment.trim() || isSubmittingReview}
                                                >
                                                    Submit Review
                                                </Button>
                                            </form>
                                        ) : (
                                            <>
                                                <Typography level="body-sm" sx={{ mb: 2 }}>
                                                    You need to be logged in to write a review.
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => navigate('/signin', { state: { from: location.pathname } })}
                                                >
                                                    Sign in to write a review
                                                </Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </TabPanel>
                </Tabs>
            </Box>

            {/* Snackbar for notifications */}
            {snackbarOpen && (
                <Alert
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        maxWidth: '90%',
                        width: '400px'
                    }}
                    color={snackbarSeverity}
                    variant="soft"
                    onClose={() => setSnackbarOpen(false)}
                    endDecorator={
                        <Button size="sm" variant="soft" color={snackbarSeverity} onClick={() => setSnackbarOpen(false)}>
                            Dismiss
                        </Button>
                    }
                >
                    {snackbarMessage}
                </Alert>
            )}
        </Container>
    );
};

export default Item;