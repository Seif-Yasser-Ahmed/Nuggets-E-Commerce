// client/src/pages/Admin/Users.js
import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Avatar,
    IconButton,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        API.get('/admin/users')
            .then((res) => {
                // assuming res.data.data contains objects with
                // id, username, email, first_name, last_name, telephone, isAdmin, created_at
                setUsers(res.data.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to fetch users');
                setLoading(false);
            });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        API.delete(`/admin/users/${id}`)
            .then(() => {
                setUsers(users.filter((u) => u.id !== id));
                showSnackbar('User deleted successfully', 'success');
            })
            .catch((err) => {
                console.error(err);
                showSnackbar('Failed to delete user', 'error');
            });
    };

    const handleMakeAdmin = (user) => {
        setSelectedUser(user);
        setConfirmDialogOpen(true);
    };

    const confirmMakeAdmin = () => {
        if (!selectedUser) return;

        // Use the correct API endpoint that matches the server route
        API.put(`/admin/users/${selectedUser.id}/admin-status`, { isAdmin: 1 })
            .then(() => {
                // Update the user in the local state
                const updatedUsers = users.map(user =>
                    user.id === selectedUser.id ? { ...user, isAdmin: 1 } : user
                );
                setUsers(updatedUsers);
                setConfirmDialogOpen(false);
                showSnackbar(`${selectedUser.username} is now an admin`, 'success');
            })
            .catch(err => {
                console.error('Error updating admin status:', err.response?.data || err.message);
                showSnackbar('Failed to update admin status', 'error');
                setConfirmDialogOpen(false);
            });
    };

    const handleCloseDialog = () => {
        setConfirmDialogOpen(false);
        setSelectedUser(null);
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-3xl font-bold mb-6">All Users</h1>

            <div className="mb-4 max-w-md">
                <TextField
                    fullWidth
                    label="Search by username"
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center">
                    <CircularProgress />
                </div>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredUsers.map((user) => (
                        <Card key={user.id} className="shadow-md flex items-center">
                            <CardContent className="w-full">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            {user.username.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <div>
                                            <Typography variant="h6">{user.username}</Typography>
                                            <Typography variant="body2" className="text-gray-600">
                                                ID: {user.id}
                                            </Typography>
                                            <Typography variant="body2">
                                                Name: {user.first_name} {user.last_name}
                                            </Typography>
                                            {user.email && (
                                                <Typography variant="body2">
                                                    Email: {user.email}
                                                </Typography>
                                            )}
                                            {user.telephone && (
                                                <Typography variant="body2">
                                                    Telephone: {user.telephone}
                                                </Typography>
                                            )}
                                            <Typography variant="body2">
                                                Role: {user.isAdmin ? 'Admin' : 'User'}
                                            </Typography>
                                            <Typography variant="body2">
                                                Created: {new Date(user.created_at).toLocaleDateString()}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {!user.isAdmin && (
                                            <IconButton
                                                onClick={() => handleMakeAdmin(user)}
                                                aria-label="make admin"
                                                color="primary"
                                                title="Make Admin"
                                            >
                                                <AdminPanelSettingsIcon />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            onClick={() => handleDelete(user.id)}
                                            aria-label="delete"
                                            className="text-red-600"
                                            color="error"
                                            title="Delete User"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCloseDialog}
                aria-labelledby="admin-confirmation-dialog-title"
                aria-describedby="admin-confirmation-dialog-description"
            >
                <DialogTitle id="admin-confirmation-dialog-title">
                    Make {selectedUser?.username} an Admin?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="admin-confirmation-dialog-description">
                        Are you sure you want to make {selectedUser?.username} an admin?
                        This will grant them full access to the admin dashboard and all administrative functions.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmMakeAdmin} color="primary" variant="contained">
                        Yes, Make Admin
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
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default Users;