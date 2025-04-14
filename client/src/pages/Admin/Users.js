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
    TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

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
            })
            .catch((err) => {
                console.error(err);
                alert('Failed to delete user');
            });
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
                                            {/* {console.log(user.username.charAt(0).toUpperCase())} */}
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
                                                {/* {console.log(user.isAdmin)} */}

                                            </Typography>
                                            <Typography variant="body2">
                                                Created: {new Date(user.created_at).toLocaleDateString()}
                                            </Typography>
                                        </div>
                                    </div>
                                    <IconButton
                                        onClick={() => handleDelete(user.id)}
                                        aria-label="delete"
                                        className="text-red-600"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Users;