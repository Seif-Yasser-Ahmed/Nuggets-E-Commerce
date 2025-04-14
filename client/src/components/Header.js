import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="bg-gray-800 text-white p-4 shadow">
            <nav className="container mx-auto flex justify-center space-x-6">
                <Link to="/" className="hover:text-gray-400">Home</Link>
                <Link to="/store" className="hover:text-gray-400">Store</Link>
                <Link to="/signup" className="hover:text-gray-400">Signup</Link>
                <Link to="/signin" className="hover:text-gray-400">Signin</Link>
                <Link to="/profile" className="hover:text-gray-400">Profile</Link>
                <Link to="/cart" className="hover:text-gray-400">Cart</Link>
            </nav>
        </header>
    );
}

export default Header;
