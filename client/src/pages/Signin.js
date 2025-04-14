// client/src/pages/Signin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signin } from '../services/authService';
import { jwtDecode } from 'jwt-decode';

function Signin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            const response = await signin({ username, password });

            if (response.data && response.data.success) {
                const { id, username } = response.data.data;
                const token = response.data.token;

                // Decode token to get isAdmin
                const decoded = jwtDecode(token);
                console.log('Decoded token:', decoded);
                const isAdmin = decoded.isAdmin;

                // Store everything
                localStorage.setItem('userId', id);
                localStorage.setItem('username', username);
                localStorage.setItem('token', token);
                localStorage.setItem('isAdmin', isAdmin);
                console.log('isAdmin:', isAdmin);

                // Redirect based on role
                if (isAdmin) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            console.error('Signin error:', error.response?.data || error.message);
            setErrorMsg('Wrong email or password');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={submitHandler} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In</h1>
                {errorMsg && <p className="mb-4 text-center text-red-500">{errorMsg}</p>}

                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username:
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password:
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Sign In
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    New here? Sign Up
                </button>
            </form>
        </div>
    );
}

export default Signin;
