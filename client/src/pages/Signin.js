// client/src/pages/Signin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signin } from '../services/authService';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '../contexts/ThemeContext';

function Signin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const { darkMode } = useTheme();

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
        <div className="flex flex-col items-center justify-center min-h-screen">
            <form onSubmit={submitHandler} className="p-8 rounded-lg shadow-md w-full max-w-sm bg-white dark:bg-gray-800 transition-colors">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Sign In</h1>
                {errorMsg && <p className="mb-4 text-center text-red-500 dark:text-red-400">{errorMsg}</p>}

                <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username:
                    </label>
                    <input
                        id="username"
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password:
                    </label>
                    <input
                        id="password"
                        type="password"
                        placeholder="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
                >
                    Sign In
                </button>

                <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition"
                >
                    New here? Sign Up
                </button>

                <p className="text-sm text-center mt-4">
                    <a
                        href="#"
                        onClick={() => navigate('/reset')}
                        className="text-blue-500 hover:underline dark:text-blue-400"
                    >
                        Forgot password?
                    </a>
                </p>
            </form>
        </div>
    );
}

export default Signin;
