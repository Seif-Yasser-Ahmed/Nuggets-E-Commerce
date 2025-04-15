// client/src/pages/Home.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export default function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPrompt, setShowPrompt] = React.useState(false);
    const { darkMode } = useTheme(); // Using the global theme context

    // Get last page from session storage
    const lastPage = sessionStorage.getItem('lastPage') || 'the previous page';

    // Block back‑nav when signed in
    React.useEffect(() => {
        const handlePopState = (event) => {
            if (localStorage.getItem('user')) {
                event.preventDefault();
                setShowPrompt(true);
                navigate(location.pathname, { replace: true });
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [location.pathname, navigate]);

    const handleSignOut = () => {
        localStorage.removeItem('user');
        setShowPrompt(false);
        navigate('/signin');
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
                <p className="mb-6 text-lg">This is the landing page of your application.</p>

                <div className="flex space-x-4">
                    <Link
                        to="/signup"
                        className="
              px-4 py-2 rounded-md
              bg-blue-500 text-white hover:bg-blue-600
              dark:bg-blue-700 dark:hover:bg-blue-800
              transition
            "
                    >
                        Sign Up
                    </Link>
                    <Link
                        to="/signin"
                        className="
              px-4 py-2 rounded-md
              bg-green-500 text-white hover:bg-green-600
              dark:bg-green-700 dark:hover:bg-green-800
              transition
            "
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/profile"
                        className="
              px-4 py-2 rounded-md
              bg-purple-500 text-white hover:bg-purple-600
              dark:bg-purple-700 dark:hover:bg-purple-800
              transition
            "
                    >
                        Profile
                    </Link>
                </div>
            </div>

            {showPrompt && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div
                        className="
              bg-white p-6 rounded shadow-md
              dark:bg-gray-800 dark:text-gray-100
              transition-colors
            "
                    >
                        <p className="mb-4">
                            Are you sure you want to go back to {lastPage}?
                        </p>
                        <button
                            onClick={handleSignOut}
                            className="
                px-4 py-2 rounded-md
                bg-red-500 text-white hover:bg-red-600
                dark:bg-red-700 dark:hover:bg-red-800
                transition
              "
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
