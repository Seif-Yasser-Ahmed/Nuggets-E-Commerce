// client/src/pages/Home.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    const location = useLocation();
    const [showPrompt, setShowPrompt] = React.useState(false);

    // Get last page from session storage (fallback to a default text)
    const lastPage = sessionStorage.getItem('lastPage') || 'the previous page';

    // Effect to attach a listener for the browser back navigation
    React.useEffect(() => {
        const handlePopState = (event) => {
            // Check if the user is signed in (adjust this condition as needed)
            if (localStorage.getItem('user')) {
                event.preventDefault();
                setShowPrompt(true);
                // Optional: push the current path back to block the navigation
                navigate(location.pathname, { replace: true });
            }
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [location.pathname, navigate]);

    // Handle sign out logic
    const handleSignOut = () => {
        // Remove user session and any state as needed
        localStorage.removeItem('user');
        // Hide the prompt and redirect to sign in (or other route)
        setShowPrompt(false);
        navigate('/signin');
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-4xl font-bold mb-4">Welcome to the Home Page</h1>
                <p className="mb-6 text-lg">This is the landing page of your application.</p>
                {/* Example links to other pages */}
                <div className="flex space-x-4">
                    <Link to="/signup" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Sign Up</Link>
                    <Link to="/signin" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Sign In</Link>
                    <Link to="/profile" className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600">Profile</Link>
                </div>
            </div>

            {showPrompt && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded shadow-md">
                        <p className="mb-4">Are you sure you want to go back to {lastPage}?</p>
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Home;
