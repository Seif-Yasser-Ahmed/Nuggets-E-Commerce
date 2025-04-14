// client/src/pages/Admin/Dashboard.js
import React from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';

function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="shadow-md">
                    <CardContent>
                        <Typography variant="h6">Manage Users</Typography>
                        <Button variant="contained" className="mt-4" href="/admin/users">View</Button>
                    </CardContent>
                </Card>
                <Card className="shadow-md">
                    <CardContent>
                        <Typography variant="h6">System Logs</Typography>
                        <Button variant="contained" className="mt-4" href="/admin/logs">View</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;
