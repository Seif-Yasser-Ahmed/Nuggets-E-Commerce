// src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    Button,
    Divider,
    IconButton,
    AspectRatio,
    Stack,
    Input,
    Sheet,
    Alert,
    CircularProgress,
    Chip
} from '@mui/joy';
import { formatImageUrl } from '../utils/imageUtils';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    DeleteOutline as DeleteIcon,
    ShoppingBag as ShoppingBagIcon,
    ArrowBack as ArrowBackIcon,
    Login as LoginIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { getCart, updateCartItem, removeCartItem, getGuestCart, saveGuestCart } from '../services/cartService';

const Cart = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [productDetails, setProductDetails] = useState({});

    // Check if user is logged in
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!(userId && token));
    }, []);

    // Fetch product details for guest cart items
    const fetchProductDetails = async (productIds) => {
        if (!productIds || productIds.length === 0) return {};

        try {
            // Implement this API endpoint or use an existing one that can retrieve multiple products
            const response = await fetch(`/api/v1/products/batch?ids=${productIds.join(',')}`);
            const data = await response.json();

            // Convert array to object with product ID as key
            const details = {};
            if (data && data.data) {
                data.data.forEach(product => {
                    details[product._id || product.id] = product;
                });
            }
            return details;
        } catch (error) {
            console.error('Error fetching product details:', error);
            return {};
        }
    };

    // Fetch cart items on component mount
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                setLoading(true);
                const userId = localStorage.getItem('userId');
                const token = localStorage.getItem('token');
                let items = [];

                if (userId && token) {
                    // User is logged in, get cart from server
                    const response = await getCart(userId);
                    // console.log("Cart response:", response);

                    // Check different possible response structures
                    if (response && response.data) {
                        if (response.data.success && Array.isArray(response.data.data)) {
                            items = response.data.data;
                        } else if (Array.isArray(response.data)) {
                            items = response.data;
                        } else if (response.success && Array.isArray(response.data)) {
                            items = response.data;
                        }
                    }
                } else {
                    // User is not logged in, get cart from local storage
                    const guestCartItems = getGuestCart();

                    if (guestCartItems.length > 0) {
                        // Fetch product details for items in guest cart
                        const productIds = guestCartItems.map(item => item.productId);
                        const details = await fetchProductDetails(productIds);
                        setProductDetails(details);

                        // Map guest cart items to format similar to server response
                        items = guestCartItems.map(item => {
                            const product = details[item.productId] || {};
                            return {
                                id: `guest-${item.productId}`, // Add prefix to distinguish from server IDs
                                product_id: item.productId,
                                name: product.name || 'Product',
                                price: product.price || 0,
                                image_url: product.image_url,
                                quantity: item.quantity,
                                category: product.category || 'Unknown',
                                currency: 'EGP'
                            };
                        });
                    }
                }

                setCartItems(items);
            } catch (error) {
                console.error('Error fetching cart:', error);
                // Don't show error for guest users with empty cart
                if (localStorage.getItem('userId')) {
                    setError('Failed to load your cart. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    // Function to update item quantity
    const handleUpdateQuantity = async (cartItemId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1) return; // Don't allow quantities less than 1

        try {
            setUpdating(true);

            // Check if this is a guest cart item
            if (cartItemId.toString().startsWith('guest-')) {
                const productId = cartItemId.replace('guest-', '');
                const guestCart = getGuestCart();

                // Update the quantity in local storage
                const updatedCart = guestCart.map(item =>
                    item.productId.toString() === productId.toString()
                        ? { ...item, quantity: newQuantity }
                        : item
                );

                saveGuestCart(updatedCart);

                // Update local state
                setCartItems(prevItems =>
                    prevItems.map(item =>
                        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                    )
                );
            } else {
                // Regular cart item, update on server
                await updateCartItem(cartItemId, { quantity: newQuantity });

                // Update local state
                setCartItems(prevItems =>
                    prevItems.map(item =>
                        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
                    )
                );
            }

            // Dispatch event to update cart count
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (error) {
            console.error('Error updating cart item:', error);
        } finally {
            setUpdating(false);
        }
    };

    // Function to remove item from cart
    const handleRemoveItem = async (cartItemId) => {
        try {
            setUpdating(true);

            // Check if this is a guest cart item
            if (cartItemId.toString().startsWith('guest-')) {
                const productId = cartItemId.replace('guest-', '');
                const guestCart = getGuestCart();

                // Remove the item from local storage
                const updatedCart = guestCart.filter(item =>
                    item.productId.toString() !== productId.toString()
                );

                saveGuestCart(updatedCart);
            } else {
                // Regular cart item, remove from server
                await removeCartItem(cartItemId);
            }

            // Update local state
            setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));

            // Dispatch event to update cart count
            window.dispatchEvent(new CustomEvent('cart-updated'));
        } catch (error) {
            console.error('Error removing cart item:', error);
        } finally {
            setUpdating(false);
        }
    };

    // Calculate cart totals
    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => {
            const itemPrice = item.price * item.quantity;
            return sum + itemPrice;
        }, 0);

        const shipping = subtotal > 0 ? 50 : 0; // Example shipping cost
        const tax = subtotal * 0.14; // Example 7% tax
        const total = subtotal + shipping + tax;

        return {
            subtotal,
            shipping,
            tax,
            total
        };
    };

    const { subtotal, shipping, tax, total } = calculateTotals();

    // Handle proceed to checkout
    const handleCheckout = () => {
        if (!isLoggedIn) {
            // Redirect to login if not logged in
            navigate('/signin', { state: { returnTo: '/cart' } });
            return;
        }
        navigate('/checkout');
    };

    // Handle continue shopping
    const handleContinueShopping = () => {
        navigate('/store');
    };

    // Handle sign in
    const handleSignIn = () => {
        navigate('/signin', { state: { returnTo: '/cart' } });
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh'
                }}
            >
                <CircularProgress size="lg" />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert
                    variant="soft"
                    color="warning"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
                <Button
                    variant="outlined"
                    color="neutral"
                    startDecorator={<ArrowBackIcon />}
                    onClick={() => navigate('/signin')}
                    sx={{ mt: 2 }}
                >
                    Sign In
                </Button>
            </Container>
        );
    }

    if (cartItems.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Card variant="outlined" sx={{ textAlign: 'center', py: 8 }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <ShoppingBagIcon sx={{ fontSize: 64, color: 'neutral.400' }} />
                        <Typography level="h3">Your Cart is Empty</Typography>
                        <Typography level="body-lg" sx={{ mb: 2, color: 'neutral.500', maxWidth: 500, mx: 'auto' }}>
                            Looks like you haven't added anything to your cart yet.
                            Browse our products and find something you'll love!
                        </Typography>
                        <Button
                            size="lg"
                            variant="solid"
                            color="primary"
                            onClick={handleContinueShopping}
                        >
                            Start Shopping
                        </Button>
                    </CardContent>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography level="h2" sx={{ mb: 4, color: darkMode ? 'primary.300' : 'neutral.800' }}>Your Shopping Cart</Typography>

            {!isLoggedIn && (
                <Alert
                    variant="soft"
                    color="primary"
                    sx={{ mb: 3 }}
                    endDecorator={
                        <Button
                            onClick={handleSignIn}
                            variant="solid"
                            color="primary"
                            size="sm"
                            startDecorator={<LoginIcon />}
                        >
                            Sign In
                        </Button>
                    }
                >
                    Sign in to save your cart and access it from any device!
                </Alert>
            )}

            <Grid container spacing={4}>
                {/* Cart Items List */}
                <Grid xs={12} md={8}>
                    <Card variant={darkMode ? 'soft' : 'outlined'} sx={{ mb: { xs: 3, md: 0 } }}>
                        <CardContent>
                            <Typography level="title-lg" sx={{ mb: 2 }}>
                                Items ({cartItems.length})
                            </Typography>

                            {cartItems.map((item) => (
                                <React.Fragment key={item.id}>
                                    <Box sx={{ display: 'flex', py: 2 }}>
                                        {/* Product Image */}
                                        <AspectRatio
                                            ratio="1/1"
                                            sx={{
                                                width: { xs: 70, sm: 90 },
                                                borderRadius: 'md',
                                                overflow: 'hidden'
                                            }}
                                        >                                            {(Array.isArray(item.images) && item.images.length > 0) || 
                                              item.image_url || item.image || 
                                              (item.product && ((Array.isArray(item.product.images) && item.product.images.length > 0) || 
                                               item.product.image_url || item.product.image)) ? (
                                            <img
                                                src={formatImageUrl(
                                                    // First check product's images array
                                                    Array.isArray(item.images) && item.images.length > 0
                                                        ? item.images[0]
                                                        // Next check direct image URLs
                                                        : item.image_url || item.image
                                                        // Then check if there's a nested product object with images
                                                        || (item.product && Array.isArray(item.product.images) && item.product.images.length > 0
                                                            ? item.product.images[0]
                                                            // Finally check for image URL on nested product
                                                            : item.product?.image_url || item.product?.image || '')
                                                )}
                                                alt={item.name || (item.product?.name || 'Product')}
                                                style={{ objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: darkMode ? 'neutral.800' : 'neutral.100',
                                                    color: 'neutral.500'
                                                }}
                                            >
                                                No image
                                            </Box>
                                        )}
                                        </AspectRatio>

                                        {/* Product Details */}
                                        <Box sx={{ ml: 2, flex: 1 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                mb: 1
                                            }}>
                                                <Typography level="title-md">{item.name}</Typography>
                                                <Typography
                                                    level="title-md"
                                                    sx={{ fontWeight: 'bold', color: darkMode ? 'primary.300' : 'primary.500' }}
                                                >
                                                    {(item.price * item.quantity).toLocaleString()} {item.currency || 'EGP'}
                                                </Typography>
                                            </Box>

                                            {item.category && (
                                                <Typography level="body-sm" sx={{ mb: 1, color: 'neutral.500' }}>
                                                    {item.category}
                                                </Typography>
                                            )}

                                            {item.size && (
                                                <Chip
                                                    variant="soft"
                                                    color="neutral"
                                                    size="sm"
                                                    sx={{ mr: 1 }}
                                                >
                                                    Size: {item.size}
                                                </Chip>
                                            )}

                                            {item.color && (
                                                <Chip
                                                    variant="soft"
                                                    color="neutral"
                                                    size="sm"
                                                >
                                                    Color: {item.color}
                                                </Chip>
                                            )}

                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mt: 2,
                                                flexDirection: { xs: 'column', sm: 'row' },
                                                alignItems: { xs: 'flex-start', sm: 'center' },
                                                gap: { xs: 1, sm: 0 }
                                            }}>
                                                {/* Quantity Controls */}
                                                <Sheet
                                                    variant="outlined"
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        borderRadius: 'md'
                                                    }}
                                                >
                                                    <IconButton
                                                        size="sm"
                                                        variant="plain"
                                                        color="neutral"
                                                        disabled={updating || item.quantity <= 1}
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                                                    >
                                                        <RemoveIcon />
                                                    </IconButton>
                                                    <Input
                                                        value={item.quantity}
                                                        sx={{
                                                            width: 40,
                                                            textAlign: 'center',
                                                            '& input': { textAlign: 'center', p: 0.5 },
                                                            border: 'none',
                                                            '&:focus-within': {
                                                                outline: 'none',
                                                            }
                                                        }}
                                                        readOnly
                                                    />
                                                    <IconButton
                                                        size="sm"
                                                        variant="plain"
                                                        color="neutral"
                                                        disabled={updating}
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </Sheet>

                                                <Typography level="body-sm" sx={{ mx: 2, display: { xs: 'none', sm: 'block' } }}>
                                                    {item.price.toLocaleString()} {item.currency || 'EGP'} each
                                                </Typography>

                                                {/* Remove Button */}
                                                <IconButton
                                                    size="sm"
                                                    variant="soft"
                                                    color="danger"
                                                    disabled={updating}
                                                    onClick={() => handleRemoveItem(item.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                </React.Fragment>
                            ))}

                            <Box sx={{ mt: 3 }}>
                                <Button
                                    variant="outlined"
                                    color="neutral"
                                    startDecorator={<ArrowBackIcon />}
                                    onClick={handleContinueShopping}
                                >
                                    Continue Shopping
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Order Summary */}
                <Grid xs={12} md={4}>
                    <Card
                        variant={darkMode ? 'soft' : 'solid'}
                        sx={{
                            position: { md: 'sticky' },
                            top: { md: '80px' },
                            bgcolor: darkMode ? 'neutral.800' : 'primary.50',
                            borderLeft: '4px solid',
                            borderColor: darkMode ? 'primary.700' : 'primary.300',
                            boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                    >
                        <CardContent>
                            <Typography
                                level="title-lg"
                                sx={{
                                    mb: 3,
                                    color: darkMode ? 'primary.200' : 'primary.600',
                                    fontWeight: 'bold'
                                }}
                            >
                                Order Summary
                            </Typography>

                            <Stack spacing={2}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: darkMode ? 'primary.300' : 'neutral.800' }}>Subtotal</Typography>
                                    <Typography sx={{ color: darkMode ? 'primary.200' : 'neutral.800', fontWeight: 'medium' }}>
                                        {subtotal.toLocaleString()} EGP
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: darkMode ? 'primary.300' : 'neutral.800' }}>Shipping</Typography>
                                    <Typography sx={{ color: darkMode ? 'primary.200' : 'neutral.800', fontWeight: 'medium' }}>
                                        {shipping.toLocaleString()} EGP
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: darkMode ? 'primary.300' : 'neutral.800' }}>Tax (14%)</Typography>
                                    <Typography sx={{ color: darkMode ? 'primary.200' : 'neutral.800', fontWeight: 'medium' }}>
                                        {tax.toLocaleString()} EGP
                                    </Typography>
                                </Box>

                                <Divider sx={{ bgcolor: darkMode ? 'neutral.700' : 'neutral.200' }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography
                                        level="title-md"
                                        sx={{ color: darkMode ? 'primary.200' : 'primary.600' }}
                                    >
                                        Total
                                    </Typography>
                                    <Typography
                                        level="title-md"
                                        sx={{
                                            color: darkMode ? 'primary.200' : 'primary.600',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {total.toLocaleString()} EGP
                                    </Typography>
                                </Box>

                                <Button
                                    color="primary"
                                    size="lg"
                                    fullWidth
                                    onClick={handleCheckout}
                                    sx={{
                                        mt: 2,
                                        fontWeight: 'bold',
                                        bgcolor: darkMode ? 'primary.600' : 'primary.500',
                                        '&:hover': {
                                            bgcolor: darkMode ? 'primary.500' : 'primary.400',
                                        }
                                    }}
                                >
                                    {isLoggedIn ? 'Proceed to Checkout' : 'Sign in to Checkout'}
                                </Button>

                                {!isLoggedIn && (
                                    <Typography
                                        level="body-sm"
                                        sx={{
                                            mt: 1,
                                            textAlign: 'center',
                                            color: darkMode ? 'neutral.300' : 'neutral.500'
                                        }}
                                    >
                                        You'll need to sign in before checkout
                                    </Typography>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Cart;