import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Paper,

    Typography,
    Grid
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const getAllUsers = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/users'); // Adjust the URL as needed
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
    }
};

function Dashboard() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await getAllUsers();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }

        fetchUsers();
    }, []);

    // Calculate distribution of user roles for the charts.
    const rolesCount = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});

    const roleLabels = Object.keys(rolesCount);
    const roleData = Object.values(rolesCount);

    const barData = {
        labels: roleLabels,
        datasets: [
            {
                label: 'Number of Users',
                data: roleData,
                backgroundColor: 'rgba(75,192,192,0.6)',
            }
        ]
    };

    const pieData = {
        labels: roleLabels,
        datasets: [
            {
                label: 'Users by Role',
                data: roleData,
                backgroundColor: [
                    'rgba(255,99,132,0.6)',
                    'rgba(54,162,235,0.6)',
                    'rgba(255,206,86,0.6)',
                    'rgba(75,192,192,0.6)'
                ]
            }
        ]
    };

    const handleNavigate = () => {
        const currentPath = window.location.pathname;
        navigate(`${currentPath}/users`);
    };

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

            <Grid container spacing={3} style={{ marginBottom: '24px' }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6" gutterBottom>
                            Users by Role (Bar Chart)
                        </Typography>
                        <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} style={{ padding: '16px' }}>
                        <Typography variant="h6" gutterBottom>
                            Users by Role (Pie Chart)
                        </Typography>
                        <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
                    </Paper>
                </Grid>
            </Grid>



            <Grid container justifyContent="flex-end" style={{ marginTop: '16px' }}>
                <Button variant="contained" color="primary" onClick={handleNavigate}>
                    Go to Users
                </Button>
            </Grid>
        </div>
    );
}

export default Dashboard;
