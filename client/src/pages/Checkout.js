// src/pages/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    FormControl,
    FormLabel,
    Input,
    RadioGroup,
    Radio,
    Stack,
    CircularProgress,
    Divider,
    Alert,
    Sheet,
    AspectRatio,
    IconButton,
    Stepper,
    Step,
    StepIndicator,
    StepButton
} from '@mui/joy';
import {
    ShoppingBag as ShoppingBagIcon,
    NavigateNext as NavigateNextIcon,
    NavigateBefore as NavigateBeforeIcon,
    LocationOn as LocationOnIcon,
    Payment as PaymentIcon,
    CheckCircle as CheckCircleIcon,
    CreditCard as CreditCardIcon,
    LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { getCart } from '../services/cartService';
import { checkout } from '../services/checkoutService';

const Checkout = () => {
    const navigate = useNavigate();
    const { darkMode } = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Form states
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        email: localStorage.getItem('email') || ''
    });

    const [paymentInfo, setPaymentInfo] = useState({
        cardName: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        method: 'credit_card'
    });

    // Validation states
    const [shippingErrors, setShippingErrors] = useState({});
    const [paymentErrors, setPaymentErrors] = useState({});

    // Fetch cart items on component mount
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                setLoading(true);
                const userId = localStorage.getItem('userId');

                if (!userId) {
                    setError('Please sign in to proceed with checkout');
                    navigate('/signin', { state: { returnTo: '/checkout' } });
                    return;
                }

                const response = await getCart(userId);

                if (response.data && response.data.success) {
                    setCartItems(response.data.data);
                } else {
                    setError('Failed to retrieve cart items');
                }
            } catch (error) {
                console.error('Error fetching cart:', error);
                setError('Failed to load your cart. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchCartItems();

        // Try to get user profile information if available
        const userProfile = JSON.parse(localStorage.getItem('userProfile'));
        if (userProfile) {
            setShippingInfo(prevInfo => ({
                ...prevInfo,
                fullName: userProfile.first_name + ' ' + userProfile.last_name,
                email: userProfile.email,
                phone: userProfile.phone || prevInfo.phone
            }));
        }
    }, [navigate]);

    // Calculate order totals
    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => {
            const itemPrice = item.price * item.quantity;
            return sum + itemPrice;
        }, 0);

        const shipping = subtotal > 0 ? 50 : 0;
        const tax = subtotal * 0.14; // 14% tax
        const total = subtotal + shipping + tax;

        return {
            subtotal,
            shipping,
            tax,
            total
        };
    };

    const { subtotal, shipping, tax, total } = calculateTotals();

    // Handle form input changes
    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo({
            ...shippingInfo,
            [name]: value
        });

        // Clear error when field is edited
        if (shippingErrors[name]) {
            setShippingErrors({
                ...shippingErrors,
                [name]: ''
            });
        }
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentInfo({
            ...paymentInfo,
            [name]: value
        });

        // Clear error when field is edited
        if (paymentErrors[name]) {
            setPaymentErrors({
                ...paymentErrors,
                [name]: ''
            });
        }
    };

    // Validate shipping form
    const validateShipping = () => {
        const errors = {};

        if (!shippingInfo.fullName.trim()) errors.fullName = 'Full name is required';
        if (!shippingInfo.address.trim()) errors.address = 'Address is required';
        if (!shippingInfo.city.trim()) errors.city = 'City is required';
        if (!shippingInfo.state.trim()) errors.state = 'State/Province is required';
        if (!shippingInfo.zip.trim()) errors.zip = 'ZIP/Postal code is required';
        if (!shippingInfo.country.trim()) errors.country = 'Country is required';
        if (!shippingInfo.phone.trim()) errors.phone = 'Phone number is required';
        if (!shippingInfo.email.trim()) errors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(shippingInfo.email)) errors.email = 'Email is invalid';

        setShippingErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate payment form
    const validatePayment = () => {
        const errors = {};

        if (paymentInfo.method === 'credit_card') {
            if (!paymentInfo.cardName.trim()) errors.cardName = 'Name on card is required';
            if (!paymentInfo.cardNumber.trim()) errors.cardNumber = 'Card number is required';
            else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, '')))
                errors.cardNumber = 'Card number should be 16 digits';

            if (!paymentInfo.expiryDate.trim()) errors.expiryDate = 'Expiry date is required';
            else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate))
                errors.expiryDate = 'Format should be MM/YY';

            if (!paymentInfo.cvv.trim()) errors.cvv = 'CVV is required';
            else if (!/^\d{3,4}$/.test(paymentInfo.cvv))
                errors.cvv = 'CVV should be 3 or 4 digits';
        }

        setPaymentErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle next step
    const handleNext = () => {
        if (activeStep === 0) {
            const isValid = validateShipping();
            if (!isValid) return;
        } else if (activeStep === 1) {
            const isValid = validatePayment();
            if (!isValid) return;
        }

        setActiveStep((prevStep) => prevStep + 1);
    };

    // Handle previous step
    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    // Handle checkout submission
    const handleCheckout = async () => {
        try {
            setSubmitting(true);

            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('Please sign in to complete checkout');
                navigate('/signin', { state: { returnTo: '/checkout' } });
                return;
            }

            const orderData = {
                order: {
                    user_id: userId,
                    total_amount: total,
                    shipping_address: {
                        fullName: shippingInfo.fullName,
                        address: shippingInfo.address,
                        city: shippingInfo.city,
                        state: shippingInfo.state,
                        zip: shippingInfo.zip,
                        country: shippingInfo.country,
                        phone: shippingInfo.phone
                    },
                    payment_method: paymentInfo.method,
                    status: 'pending'
                },
                orderItems: cartItems.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price,
                    name: item.name,
                    image_url: item.image_url
                }))
            };

            const response = await checkout(orderData);

            if (response.data && response.data.success) {
                setOrderSuccess(true);
                setOrderId(response.data.orderId);
                // Dispatch event to update cart count in navbar
                window.dispatchEvent(new CustomEvent('cart-updated'));
            } else {
                setError('Failed to process your order. Please try again.');
            }
        } catch (error) {
            console.error('Error processing checkout:', error);
            setError('An error occurred during checkout. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // Format card number with spaces for better readability
    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    // Handle card number input
    const handleCardNumberChange = (e) => {
        const formattedValue = formatCardNumber(e.target.value);
        setPaymentInfo({
            ...paymentInfo,
            cardNumber: formattedValue
        });

        if (paymentErrors.cardNumber) {
            setPaymentErrors({
                ...paymentErrors,
                cardNumber: ''
            });
        }
    };

    // Handle CVV input - only allow numbers and limit length
    const handleCvvChange = (e) => {
        const value = e.target.value.replace(/\D/g, '').substring(0, 4);
        setPaymentInfo({
            ...paymentInfo,
            cvv: value
        });

        if (paymentErrors.cvv) {
            setPaymentErrors({
                ...paymentErrors,
                cvv: ''
            });
        }
    };

    // Format expiry date to MM/YY
    const handleExpiryDateChange = (e) => {
        let { value } = e.target;
        value = value.replace(/\D/g, '');

        if (value.length > 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }

        setPaymentInfo({
            ...paymentInfo,
            expiryDate: value
        });

        if (paymentErrors.expiryDate) {
            setPaymentErrors({
                ...paymentErrors,
                expiryDate: ''
            });
        }
    };

    // Stepper component
    const steps = ['Shipping', 'Payment', 'Review'];

    // If loading
    if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <CircularProgress size="lg" />
            </Box>
        );
    }

    // If there's an error
    if (error && !cartItems.length) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert color="danger" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/cart')}
                    startDecorator={<ShoppingBagIcon />}
                >
                    Back to Cart
                </Button>
            </Container>
        );
    }

    // If order was successful
    if (orderSuccess) {
        return (
            <Container maxWidth="md" sx={{ py: 6, textAlign: 'center' }}>
                <Card variant="outlined" sx={{ p: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.500', mb: 2 }} />
                    <Typography level="h2" sx={{ mb: 2, color: 'success.600' }}>
                        Order Confirmed!
                    </Typography>
                    <Typography level="body-lg" sx={{ mb: 4 }}>
                        Thank you for your order. Your order number is <strong>#{orderId}</strong>.
                    </Typography>
                    <Typography level="body-md" sx={{ mb: 4 }}>
                        We've sent a confirmation email to <strong>{shippingInfo.email}</strong>.
                        You can track your order status in your account's order history.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            onClick={() => navigate('/profile')}
                            variant="outlined"
                            color="neutral"
                        >
                            View Order Details
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            variant="solid"
                        >
                            Continue Shopping
                        </Button>
                    </Box>
                </Card>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography level="h3" sx={{ mb: 4, fontWeight: 'bold', color: darkMode ? 'primary.300' : 'neutral.800' }} >
                Checkout
            </Typography>

            <Stepper
                sx={{
                    my: 4,
                    '& .MuiStep-root': {
                        flex: 1,
                        minWidth: 0,
                        position: 'relative'
                    },
                    '& .MuiStepButton-root': {
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1
                    },
                    '& .MuiStepIndicator-root': {
                        width: 40,
                        height: 40,
                        marginBottom: 1
                    },
                    '& .MuiSvgIcon-root': {
                        fontSize: '1.25rem'
                    }
                }}
                activeStep={activeStep}
            >
                {steps.map((step, index) => (
                    <Step
                        key={step}
                        completed={activeStep > index}
                        active={activeStep === index}
                        sx={{
                            '& .MuiStepLabel-label': {
                                mt: 1,
                                textAlign: 'center',
                                fontSize: '0.875rem',
                                color: activeStep === index ?
                                    (darkMode ? 'primary.300' : 'primary.600') :
                                    (darkMode ? 'neutral.400' : 'neutral.600')
                            }
                        }}
                    >
                        <StepButton
                            onClick={() => {
                                if (index < activeStep) setActiveStep(index);
                            }}
                            sx={{
                                cursor: index < activeStep ? 'pointer' : 'default',
                                p: 0
                            }}
                        >
                            <StepIndicator
                                variant={activeStep === index ? "solid" : "soft"}
                                color={activeStep >= index ? "primary" : "neutral"}
                            >
                                {index === 0 ? (
                                    <LocationOnIcon />
                                ) : index === 1 ? (
                                    <PaymentIcon />
                                ) : (
                                    <CheckCircleIcon />
                                )}
                            </StepIndicator>
                            <Typography
                                level="body-sm"
                                fontWeight={activeStep === index ? 'bold' : 'normal'}
                            >
                                {step}
                            </Typography>
                        </StepButton>
                    </Step>
                ))}
            </Stepper>

            <Grid container spacing={4}>
                {/* Checkout form */}
                <Grid xs={12} md={8}>
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            {/* Shipping Information */}
                            {activeStep === 0 && (
                                <Box>
                                    <Typography level="h5" sx={{ mb: 3 }}>
                                        Shipping Information
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid xs={12}>
                                            <FormControl error={!!shippingErrors.fullName}>
                                                <FormLabel>Full Name</FormLabel>
                                                <Input
                                                    name="fullName"
                                                    value={shippingInfo.fullName}
                                                    onChange={handleShippingChange}
                                                />
                                                {shippingErrors.fullName && (
                                                    <Typography level="body-xs" color="danger">
                                                        {shippingErrors.fullName}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12}>
                                            <FormControl error={!!shippingErrors.address}>
                                                <FormLabel>Street Address</FormLabel>
                                                <Input
                                                    name="address"
                                                    value={shippingInfo.address}
                                                    onChange={handleShippingChange}
                                                />
                                                {shippingErrors.address && (
                                                    <Typography level="body-xs" color="danger">
                                                        {shippingErrors.address}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl error={!!shippingErrors.city}>
                                                <FormLabel>City</FormLabel>
                                                <Input
                                                    name="city"
                                                    value={shippingInfo.city}
                                                    onChange={handleShippingChange}
                                                />
                                                {shippingErrors.city && (
                                                    <Typography level="body-xs" color="danger">
                                                        {shippingErrors.city}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl error={!!shippingErrors.state}>
                                                <FormLabel>State/Province</FormLabel>
                                                <Input
                                                    name="state"
                                                    value={shippingInfo.state}
                                                    onChange={handleShippingChange}
                                                />
                                                {shippingErrors.state && (
                                                    <Typography level="body-xs" color="danger">
                                                        {shippingErrors.state}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl error={!!shippingErrors.zip}>
                                                <FormLabel>ZIP/Postal Code</FormLabel>
                                                <Input
                                                    name="zip"
                                                    value={shippingInfo.zip}
                                                    onChange={handleShippingChange}
                                                />
                                                {shippingErrors.zip && (
                                                    <Typography level="body-xs" color="danger">
                                                        {shippingErrors.zip}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl error={!!shippingErrors.country}>
                                                <FormLabel>Country</FormLabel>
                                                <Input
                                                    name="country"
                                                    value={shippingInfo.country}
                                                    onChange={handleShippingChange}
                                                />
                                                {shippingErrors.country && (
                                                    <Typography level="body-xs" color="danger">
                                                        {shippingErrors.country}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl error={!!shippingErrors.phone}>
                                                <FormLabel>Phone</FormLabel>
                                                <Input
                                                    name="phone"
                                                    value={shippingInfo.phone}
                                                    onChange={handleShippingChange}
                                                />
                                                {shippingErrors.phone && (
                                                    <Typography level="body-xs" color="danger">
                                                        {shippingErrors.phone}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>

                                        <Grid xs={12} sm={6}>
                                            <FormControl error={!!shippingErrors.email}>
                                                <FormLabel>Email</FormLabel>
                                                <Input
                                                    name="email"
                                                    value={shippingInfo.email}
                                                    onChange={handleShippingChange}
                                                    type="email"
                                                />
                                                {shippingErrors.email && (
                                                    <Typography level="body-xs" color="danger">
                                                        {shippingErrors.email}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}

                            {/* Payment Information */}
                            {activeStep === 1 && (
                                <Box>
                                    <Typography level="h5" sx={{ mb: 3 }}>
                                        Payment Method
                                    </Typography>

                                    <FormControl sx={{ mb: 3 }}>
                                        <RadioGroup
                                            name="method"
                                            value={paymentInfo.method}
                                            onChange={handlePaymentChange}
                                        >
                                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                                <Sheet
                                                    component="label"
                                                    sx={{
                                                        p: 2,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        boxShadow: 'sm',
                                                        borderRadius: 'md',
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: paymentInfo.method === 'credit_card' ?
                                                            'primary.500' : 'neutral.300',
                                                        flexGrow: { xs: 1, sm: 0 },
                                                        minWidth: 150
                                                    }}
                                                >
                                                    <Radio
                                                        value="credit_card"
                                                        label=""
                                                        sx={{ alignSelf: 'flex-end' }}
                                                    />
                                                    <CreditCardIcon sx={{ fontSize: 40, mb: 1 }} />
                                                    <Typography level="body-sm">Credit Card</Typography>
                                                </Sheet>

                                                <Sheet
                                                    component="label"
                                                    sx={{
                                                        p: 2,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        boxShadow: 'sm',
                                                        borderRadius: 'md',
                                                        cursor: 'pointer',
                                                        border: '1px solid',
                                                        borderColor: paymentInfo.method === 'cash_on_delivery' ?
                                                            'primary.500' : 'neutral.300',
                                                        flexGrow: { xs: 1, sm: 0 },
                                                        minWidth: 150
                                                    }}
                                                >
                                                    <Radio
                                                        value="cash_on_delivery"
                                                        label=""
                                                        sx={{ alignSelf: 'flex-end' }}
                                                    />
                                                    <LocalShippingIcon sx={{ fontSize: 40, mb: 1 }} />
                                                    <Typography level="body-sm">Cash on Delivery</Typography>
                                                </Sheet>
                                            </Box>
                                        </RadioGroup>
                                    </FormControl>

                                    {paymentInfo.method === 'credit_card' && (
                                        <Grid container spacing={2}>
                                            <Grid xs={12}>
                                                <FormControl error={!!paymentErrors.cardName}>
                                                    <FormLabel>Name on Card</FormLabel>
                                                    <Input
                                                        name="cardName"
                                                        value={paymentInfo.cardName}
                                                        onChange={handlePaymentChange}
                                                    />
                                                    {paymentErrors.cardName && (
                                                        <Typography level="body-xs" color="danger">
                                                            {paymentErrors.cardName}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            </Grid>

                                            <Grid xs={12}>
                                                <FormControl error={!!paymentErrors.cardNumber}>
                                                    <FormLabel>Card Number</FormLabel>
                                                    <Input
                                                        name="cardNumber"
                                                        value={paymentInfo.cardNumber}
                                                        onChange={handleCardNumberChange}
                                                        placeholder="XXXX XXXX XXXX XXXX"
                                                    />
                                                    {paymentErrors.cardNumber && (
                                                        <Typography level="body-xs" color="danger">
                                                            {paymentErrors.cardNumber}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            </Grid>

                                            <Grid xs={6}>
                                                <FormControl error={!!paymentErrors.expiryDate}>
                                                    <FormLabel>Expiry Date</FormLabel>
                                                    <Input
                                                        name="expiryDate"
                                                        value={paymentInfo.expiryDate}
                                                        onChange={handleExpiryDateChange}
                                                        placeholder="MM/YY"
                                                    />
                                                    {paymentErrors.expiryDate && (
                                                        <Typography level="body-xs" color="danger">
                                                            {paymentErrors.expiryDate}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            </Grid>

                                            <Grid xs={6}>
                                                <FormControl error={!!paymentErrors.cvv}>
                                                    <FormLabel>CVV</FormLabel>
                                                    <Input
                                                        name="cvv"
                                                        value={paymentInfo.cvv}
                                                        onChange={handleCvvChange}
                                                        placeholder="XXX"
                                                    />
                                                    {paymentErrors.cvv && (
                                                        <Typography level="body-xs" color="danger">
                                                            {paymentErrors.cvv}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    )}
                                </Box>
                            )}

                            {/* Review Order */}
                            {activeStep === 2 && (
                                <Box>
                                    <Typography level="h5" sx={{ mb: 3 }}>
                                        Review Your Order
                                    </Typography>

                                    <Box sx={{ mb: 4 }}>
                                        <Typography level="title-md" sx={{ mb: 1 }}>
                                            Shipping Details
                                        </Typography>
                                        <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md' }}>
                                            <Typography>{shippingInfo.fullName}</Typography>
                                            <Typography>{shippingInfo.address}</Typography>
                                            <Typography>
                                                {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                                            </Typography>
                                            <Typography>{shippingInfo.country}</Typography>
                                            <Typography>Phone: {shippingInfo.phone}</Typography>
                                            <Typography>Email: {shippingInfo.email}</Typography>
                                        </Sheet>
                                    </Box>

                                    <Box sx={{ mb: 4 }}>
                                        <Typography level="title-md" sx={{ mb: 1 }}>
                                            Payment Method
                                        </Typography>
                                        <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md' }}>
                                            {paymentInfo.method === 'credit_card' ? (
                                                <>
                                                    <Typography>Credit Card</Typography>
                                                    <Typography>
                                                        {paymentInfo.cardName} •••• {paymentInfo.cardNumber.slice(-4)}
                                                    </Typography>
                                                </>
                                            ) : (
                                                <Typography>Cash on Delivery</Typography>
                                            )}
                                        </Sheet>
                                    </Box>

                                    <Box>
                                        <Typography level="title-md" sx={{ mb: 1 }}>
                                            Order Items
                                        </Typography>
                                        <Stack spacing={2}>
                                            {cartItems.map((item) => (
                                                <Sheet
                                                    key={item.id}
                                                    variant="soft"
                                                    sx={{
                                                        p: 1.5,
                                                        borderRadius: 'md',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 2
                                                    }}
                                                >
                                                    <AspectRatio
                                                        ratio="1"
                                                        sx={{ width: 60, borderRadius: 'md', overflow: 'hidden' }}
                                                    >
                                                        {item.image_url ? (
                                                            <img
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                style={{ objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <Box sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                bgcolor: darkMode ? 'neutral.700' : 'neutral.200'
                                                            }}>
                                                                No image
                                                            </Box>
                                                        )}
                                                    </AspectRatio>

                                                    <Box sx={{ flexGrow: 1 }}>
                                                        <Typography level="title-sm">{item.name}</Typography>
                                                        <Typography level="body-sm" color="neutral">
                                                            Quantity: {item.quantity}
                                                        </Typography>
                                                    </Box>

                                                    <Typography level="title-sm">
                                                        {(item.price * item.quantity).toLocaleString()} EGP
                                                    </Typography>
                                                </Sheet>
                                            ))}
                                        </Stack>
                                    </Box>

                                    {error && (
                                        <Alert color="danger" sx={{ mt: 3 }}>
                                            {error}
                                        </Alert>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                        {activeStep > 0 ? (
                            <Button
                                variant="outlined"
                                startDecorator={<NavigateBeforeIcon />}
                                onClick={handleBack}
                            >
                                Back
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/cart')}
                            >
                                Return to Cart
                            </Button>
                        )}

                        {activeStep < steps.length - 1 ? (
                            <Button
                                variant="solid"
                                endDecorator={<NavigateNextIcon />}
                                onClick={handleNext}
                            >
                                {activeStep === 0 ? 'Continue to Payment' : 'Review Order'}
                            </Button>
                        ) : (
                            <Button
                                variant="solid"
                                color="primary"
                                onClick={handleCheckout}
                                loading={submitting}
                                disabled={submitting}
                            >
                                Place Order
                            </Button>
                        )}
                    </Box>
                </Grid>

                {/* Order Summary */}
                <Grid xs={12} md={4}>
                    <Card variant={darkMode ? 'soft' : 'outlined'} sx={{ position: 'sticky', top: '80px' }}>
                        <CardContent>
                            <Typography level="h5" sx={{ mb: 2 }}>
                                Order Summary
                            </Typography>

                            <Typography level="body-sm" sx={{ mb: 2, color: 'neutral.600' }}>
                                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                            </Typography>

                            <Divider sx={{ mb: 2 }} />

                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Subtotal</Typography>
                                    <Typography>{subtotal.toLocaleString()} EGP</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Shipping</Typography>
                                    <Typography>{shipping.toLocaleString()} EGP</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>Tax (14%)</Typography>
                                    <Typography>{tax.toLocaleString()} EGP</Typography>
                                </Box>

                                <Divider />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography level="title-md">Total</Typography>
                                    <Typography level="title-md">{total.toLocaleString()} EGP</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Checkout;