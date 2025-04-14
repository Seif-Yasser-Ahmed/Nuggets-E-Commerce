// client/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
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
    );
}

export default Home;
