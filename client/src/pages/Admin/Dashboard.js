import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Divider
} from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import {
    PeopleAlt as PeopleIcon,
    Inventory as InventoryIcon,
    ShoppingCart as OrdersIcon,
    AssessmentOutlined as ReportsIcon
} from '@mui/icons-material';
import API from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function Dashboard() {
    const [usersCount, setUsersCount] = useState(0);
    const [productsCount, setProductsCount] = useState(0);
    const [orderStats, setOrderStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch dashboard data
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                // Fetch users count
                const usersResponse = await API.get('/admin/users');
                setUsersCount(usersResponse.data.data.length);

                // Fetch products count
                const productsResponse = await API.get('/products');
                setProductsCount(productsResponse.data.data.length);

                // Fetch order statistics
                const orderStatsResponse = await API.get('/orders/stats');
                setOrderStats(orderStatsResponse.data.data || []);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Prepare order statistics for charts
    const orderStatusLabels = orderStats.map(stat => stat.status.charAt(0).toUpperCase() + stat.status.slice(1));
    const orderCountData = orderStats.map(stat => stat.count);
    const orderTotalData = orderStats.map(stat => stat.total);

    const orderStatusData = {
        labels: orderStatusLabels,
        datasets: [
            {
                label: 'Orders by Status',
                data: orderCountData,
                backgroundColor: [
                    'rgba(255, 206, 86, 0.6)', // pending - yellow
                    'rgba(54, 162, 235, 0.6)', // processing - blue
                    'rgba(153, 102, 255, 0.6)', // shipped - purple
                    'rgba(75, 192, 192, 0.6)', // delivered - green
                    'rgba(255, 99, 132, 0.6)', // cancelled - red
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    // Navigation functions
    const handleNavigateToUsers = () => navigate('/admin/dashboard/users');
    const handleNavigateToProducts = () => navigate('/admin/dashboard/products');
    const handleNavigateToOrders = () => navigate('/admin/dashboard/orders');
    const handleNavigateToLogs = () => navigate('/admin/dashboard/logs');

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                style={{ fontWeight: 'bold', marginBottom: '24px' }}
            >
                Admin Dashboard
            </Typography>

            {/* Quick Access Cards */}
            <Grid container spacing={3} style={{ marginBottom: '32px' }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
                            <Typography variant="h5" component="div">
                                Users
                            </Typography>
                            <Typography variant="h3" color="text.secondary">
                                {usersCount}
                            </Typography>
                        </CardContent>
                        <Divider />
                        <CardActions>
                            <Button size="small" onClick={handleNavigateToUsers}>Manage Users</Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <InventoryIcon color="secondary" sx={{ fontSize: 40, mb: 2 }} />
                            <Typography variant="h5" component="div">
                                Products
                            </Typography>
                            <Typography variant="h3" color="text.secondary">
                                {productsCount}
                            </Typography>
                        </CardContent>
                        <Divider />
                        <CardActions>
                            <Button size="small" onClick={handleNavigateToProducts}>Manage Products</Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <OrdersIcon sx={{ color: 'success.main', fontSize: 40, mb: 2 }} />
                            <Typography variant="h5" component="div">
                                Orders
                            </Typography>
                            <Typography variant="h3" color="text.secondary">
                                {orderStats.reduce((sum, stat) => sum + stat.count, 0)}
                            </Typography>
                        </CardContent>
                        <Divider />
                        <CardActions>
                            <Button size="small" onClick={handleNavigateToOrders}>Manage Orders</Button>
                        </CardActions>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <ReportsIcon sx={{ color: 'info.main', fontSize: 40, mb: 2 }} />
                            <Typography variant="h5" component="div">
                                System Logs
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                View system activity and errors
                            </Typography>
                        </CardContent>
                        <Divider />
                        <CardActions>
                            <Button size="small" onClick={handleNavigateToLogs}>View Logs</Button>
                        </CardActions>
                    </Card>
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3}>
                {/* Order Status Chart */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6" gutterBottom>
                            Orders by Status
                        </Typography>
                        {isLoading ? (
                            <Typography>Loading chart data...</Typography>
                        ) : orderStats.length > 0 ? (
                            <Bar
                                data={orderStatusData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            display: false
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <Typography>No order data available</Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Order Distribution Pie Chart */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6" gutterBottom>
                            Order Distribution
                        </Typography>
                        {isLoading ? (
                            <Typography>Loading chart data...</Typography>
                        ) : orderStats.length > 0 ? (
                            <Pie
                                data={orderStatusData}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        legend: {
                                            position: 'bottom'
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <Typography>No order data available</Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
}

export default Dashboard;
