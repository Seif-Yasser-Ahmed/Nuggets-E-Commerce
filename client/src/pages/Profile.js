// client/src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/authService';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [user, setUser] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    // Retrieve the user ID from localStorage.
    // Ensure that your Signin component stores the user id in localStorage (e.g., under 'userId')
    const storedUserId = localStorage.getItem('userId');

    useEffect(() => {
        if (!storedUserId) {
            setErrorMsg('No user ID found. Please sign in.');
            return;
        }
        // Call getProfile with the stored user id
        getProfile(storedUserId)
            .then((response) => {
                setUser(response.data.data);
            })
            .catch((error) => {
                console.error('Error fetching profile:', error);
                setErrorMsg('Failed to fetch profile');
            });
    }, [storedUserId]);

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
                    {/* Display any additional user details here */}
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
