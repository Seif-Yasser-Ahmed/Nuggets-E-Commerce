// client/src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [user, setUser] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId'); // Read value inside useEffect
        if (!storedUserId) {
            setErrorMsg('No user ID found. Please sign in.');
            return;
        }
        // Fetch the profile using the current user id from localStorage.
        getProfile(storedUserId)
            .then((response) => {
                setUser(response.data.data);
            })
            .catch((error) => {
                console.error('Error fetching profile:', error);
                setErrorMsg('Failed to fetch profile');
            });
    }, []); // Run on mount

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <div className="container mx-auto mt-4 p-4">
                {errorMsg && <p className="text-red-500">{errorMsg}</p>}
                {user ? (
                    <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
                        <p className="mb-2">
                            <strong>ID:</strong> {user.id}
                        </p>
                        <p className="mb-2">
                            <strong>Username:</strong> {user.username}
                        </p>
                    </div>
                ) : (
                    !errorMsg && <p>Loading profile...</p>
                )}
                <button
                    className={`mt-4 py-2 px-4 rounded-md ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
            </div>
        </div>
    );
}

export default Profile;
