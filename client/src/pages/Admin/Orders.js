import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    Snackbar,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Tabs,
    Tab,
    Divider,
    Grid,
    Card,
    CardContent,
    TextField,
    IconButton,
    InputAdornment
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as VisibilityIcon,
    LocalShipping as ShippingIcon,
    Inventory as InventoryIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Assignment as AssignmentIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import API from '../../services/api';

const Orders = () => {
    // State
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentTab, setCurrentTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [orderDetails, setOrderDetails] = useState(null);
    const [viewingDetails, setViewingDetails] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Fetch orders on component mount and when tab changes
    useEffect(() => {
        fetchOrders();
    }, [currentTab]);

    // Function to fetch orders
    const fetchOrders = async () => {
        setLoading(true);
        try {
            let endpoint = '/orders';

            // If tab is not 'all', get orders by status
            if (currentTab !== 'all') {
                endpoint = `/orders/status/${currentTab}`;
            }

            const response = await API.get(endpoint);
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to view order details
    const handleViewOrder = async (orderId) => {
        setLoading(true);
        try {
            const response = await API.get(`/orders/${orderId}`);
            setOrderDetails(response.data.data);
            setViewingDetails(true);
        } catch (error) {
            console.error('Error fetching order details:', error);
            setSnackbar({
                open: true,
                message: 'Failed to fetch order details',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Function to open status change dialog
    const handleOpenStatusDialog = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setStatusDialogOpen(true);
    };

    // Function to update order status
    const handleUpdateStatus = async () => {
        try {
            await API.put(`/orders/${selectedOrder.id}/status`, { status: newStatus });

            // Update the order in the local state
            const updatedOrders = orders.map(order =>
                order.id === selectedOrder.id ? { ...order, status: newStatus } : order
            );
            setOrders(updatedOrders);

            setStatusDialogOpen(false);
            setSnackbar({
                open: true,
                message: 'Order status updated successfully',
                severity: 'success'
            });

            // Refresh orders if we're viewing filtered orders
            if (currentTab !== 'all' && currentTab !== newStatus) {
                fetchOrders();
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update order status',
                severity: 'error'
            });
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Filter orders based on search term
    const filteredOrders = orders.filter(order => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
            order.id.toString().includes(searchTermLower) ||
            order.username.toLowerCase().includes(searchTermLower) ||
            order.email.toLowerCase().includes(searchTermLower) ||
            order.status.toLowerCase().includes(searchTermLower)
        );
    });

    // Function to get status chip color
    const getStatusChipColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'shipped':
                return 'primary';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    // Function to get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <AssignmentIcon />;
            case 'processing':
                return <InventoryIcon />;
            case 'shipped':
                return <ShippingIcon />;
            case 'delivered':
                return <CheckCircleIcon />;
            case 'cancelled':
                return <CancelIcon />;
            default:
                return null;
        }
    };

    // Render order details view
    const renderOrderDetails = () => {
        if (!orderDetails) return null;

        return (
            <Box>
                <Box display="flex" alignItems="center" mb={3}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => setViewingDetails(false)}
                        variant="outlined"
                        sx={{ mr: 2 }}
                    >
                        Back to Orders
                    </Button>
                    <Typography variant="h5" component="h2">
                        Order #{orderDetails.id}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Summary
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Order ID
                                    </Typography>
                                    <Typography variant="body1">
                                        #{orderDetails.id}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Date
                                    </Typography>
                                    <Typography variant="body1">
                                        {new Date(orderDetails.created_at).toLocaleString()}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        icon={getStatusIcon(orderDetails.status)}
                                        label={orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
                                        color={getStatusChipColor(orderDetails.status)}
                                        size="small"
                                        sx={{ mt: 0.5 }}
                                    />
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Amount
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        ${Number(orderDetails.total_amount).toFixed(2)}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Payment Method
                                    </Typography>
                                    <Typography variant="body1">
                                        {orderDetails.payment_method}
                                    </Typography>
                                </Box>

                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => handleOpenStatusDialog(orderDetails)}
                                    >
                                        Update Status
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Customer Information */}
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Customer Information
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Customer
                                    </Typography>
                                    <Typography variant="body1">
                                        {orderDetails.username}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1">
                                        {orderDetails.email}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 1 }}>
                                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                                        Shipping Address
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    {orderDetails.shipping_address && (
                                        <>
                                            <Typography variant="body1">
                                                {orderDetails.shipping_address.street}
                                            </Typography>
                                            <Typography variant="body1">
                                                {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.zip}
                                            </Typography>
                                            <Typography variant="body1">
                                                {orderDetails.shipping_address.country}
                                            </Typography>
                                            <Typography variant="body1">
                                                Phone: {orderDetails.shipping_address.phone}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Order Items */}
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Order Items
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {orderDetails.items && orderDetails.items.length > 0 ? (
                                    orderDetails.items.map((item) => (
                                        <Box key={item.id} sx={{ display: 'flex', mb: 2, pb: 2, borderBottom: '1px solid #eee' }}>
                                            <Box sx={{ width: 60, height: 60, mr: 2 }}>
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Box sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        bgcolor: 'grey.200',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <InventoryIcon color="disabled" />
                                                    </Box>
                                                )}
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" noWrap>
                                                    {item.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {item.quantity} × ${Number(item.price).toFixed(2)}
                                                </Typography>
                                                <Typography variant="body1" fontWeight="bold">
                                                    ${(item.quantity * item.price).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body1">No items in this order</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    // Main render
    return (
        <Box sx={{ p: 4 }}>
            {viewingDetails ? (
                renderOrderDetails()
            ) : (
                <>
                    <Typography variant="h4" gutterBottom>
                        Order Management
                    </Typography>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Tabs for order status filtering */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab value="all" label="All Orders" />
                            <Tab value="pending" label="Pending" />
                            <Tab value="processing" label="Processing" />
                            <Tab value="shipped" label="Shipped" />
                            <Tab value="delivered" label="Delivered" />
                            <Tab value="cancelled" label="Cancelled" />
                        </Tabs>
                    </Box>

                    {/* Search Box */}
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            placeholder="Search orders by ID, customer, or status..."
                            variant="outlined"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Box>

                    {/* Orders Table */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : filteredOrders.length > 0 ? (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Order ID</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Customer</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div>{order.username}</div>
                                                <div style={{ color: 'gray', fontSize: '0.8rem' }}>{order.email}</div>
                                            </TableCell>
                                            <TableCell>${Number(order.total_amount).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    color={getStatusChipColor(order.status)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleViewOrder(order.id)}
                                                    size="small"
                                                    sx={{ mr: 1 }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleOpenStatusDialog(order)}
                                                    size="small"
                                                >
                                                    Update
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Alert severity="info">
                            No orders found. {searchTerm ? "Try changing your search criteria." : ""}
                        </Alert>
                    )}
                </>
            )}

            {/* Status Update Dialog */}
            <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            label="Status"
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="processing">Processing</MenuItem>
                            <MenuItem value="shipped">Shipped</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdateStatus} variant="contained" color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Orders;