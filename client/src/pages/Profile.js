// client/src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [user, setUser] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

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
        <div className="container mx-auto mt-4 p-4">
            {errorMsg && <p className="text-red-500">{errorMsg}</p>}
            {user ? (
                <div>
                    <h1 className="text-2xl font-bold mb-4">User Profile</h1>
                    <p>
                        <strong>ID:</strong> {user.id}
                    </p>
                    <p>
                        <strong>Username:</strong> {user.username}
                    </p>
                </div>
            ) : (
                !errorMsg && <p>Loading profile...</p>
            )}
            <button
                className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                onClick={() => navigate(-1)}
            >
                Back
            </button>
        </div>
    );
}

export default Profile;
