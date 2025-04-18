// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getCartCount } from '../services/userService';
import { getGuestCart } from '../services/cartService'; // Import guest cart function
import DarkModeToggle from './DarkModeToggle';
import { Typography, Button, IconButton, Badge, Avatar, Menu, MenuItem, Box, Drawer, List, ListItem } from '@mui/joy';
import { AppBar, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';

export default function Navbar() {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [cartCount, setCartCount] = useState(0);

    // Fetch cart count for logged-in user
    const fetchCartCount = async (userId) => {
        try {
            const response = await getCartCount(userId);
            if (response.data && response.data.success) {
                setCartCount(response.data.data.count || 0);
            }
        } catch (error) {
            console.error('Error fetching cart count:', error);
            setCartCount(0); // Default to 0 on error
        }
    };

    // Get cart count for guest user from localStorage
    const getGuestCartCount = () => {
        try {
            const guestCartItems = getGuestCart();
            // Calculate total quantity of items in guest cart
            const count = guestCartItems.reduce((total, item) => total + item.quantity, 0);
            setCartCount(count);
        } catch (error) {
            console.error('Error getting guest cart count:', error);
            setCartCount(0);
        }
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (user && userId && token) {
            setIsLoggedIn(true);
            setIsAdmin(localStorage.getItem('isAdmin') === 'true');

            // Fetch real cart count from database for logged in user
            fetchCartCount(userId);
        } else {
            setIsLoggedIn(false);
            setIsAdmin(false);

            // Get cart count from localStorage for guest user
            getGuestCartCount();
        }
    }, []);

    // Listen for cart updates
    useEffect(() => {
        // Create a function to handle cart update events
        const handleCartUpdate = () => {
            const userId = localStorage.getItem('userId');
            const token = localStorage.getItem('token');

            if (userId && token) {
                // User is logged in, fetch from server
                fetchCartCount(userId);
            } else {
                // User is a guest, get count from localStorage
                getGuestCartCount();
            }
        };

        // Add event listener for cart updates
        window.addEventListener('cart-updated', handleCartUpdate);

        // Clean up event listener
        return () => {
            window.removeEventListener('cart-updated', handleCartUpdate);
        };
    }, []);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        setIsLoggedIn(false);
        setIsAdmin(false);

        // Update cart count to show guest cart after logout
        getGuestCartCount();

        navigate('/signin', { replace: true });
    };

    const menuId = 'primary-account-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            id={menuId}
            open={open}
            onClose={handleMenuClose}
            placement="bottom-end"
        >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
                <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} /> Profile
            </MenuItem>
            {isAdmin && (
                <MenuItem onClick={() => { handleMenuClose(); navigate('/admin/dashboard'); }}>
                    <StorefrontIcon sx={{ mr: 1, fontSize: 20 }} /> Admin Dashboard
                </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} /> Sign Out
            </MenuItem>
        </Menu>
    );

    const drawer = (
        <Box sx={{ width: 250, p: 2, height: '100%', bgcolor: darkMode ? 'neutral.900' : 'background.surface' }}>
            <Typography level="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Nuggets Shop</Typography>
            <List>
                <ListItem>
                    <Link to="/" className={`w-full py-2 px-3 rounded-md transition-colors ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                        Home
                    </Link>
                </ListItem>
                <ListItem>
                    <Link to="/store" className={`w-full py-2 px-3 rounded-md transition-colors ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                        Store
                    </Link>
                </ListItem>
                {!isLoggedIn ? (
                    <>
                        <ListItem>
                            <Link to="/signin" className={`w-full py-2 px-3 rounded-md transition-colors ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                                Sign In
                            </Link>
                        </ListItem>
                        <ListItem>
                            <Link to="/signup" className={`w-full py-2 px-3 rounded-md transition-colors ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                                Sign Up
                            </Link>
                        </ListItem>
                    </>
                ) : (
                    <>
                        <ListItem>
                            <Link to="/profile" className={`w-full py-2 px-3 rounded-md transition-colors ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                                Profile
                            </Link>
                        </ListItem>
                        <ListItem>
                            <Link to="/cart" className={`w-full py-2 px-3 rounded-md transition-colors ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                                Cart {cartCount > 0 && `(${cartCount})`}
                            </Link>
                        </ListItem>
                        {isAdmin && (
                            <ListItem>
                                <Link to="/admin/dashboard" className={`w-full py-2 px-3 rounded-md transition-colors ${darkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}>
                                    Admin Dashboard
                                </Link>
                            </ListItem>
                        )}
                        <ListItem>
                            <Button onClick={handleLogout} variant="soft" color="danger" fullWidth>
                                Sign Out
                            </Button>
                        </ListItem>
                    </>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="sticky" color={darkMode ? "neutral" : "primary"} sx={{
                py: 1,
                bgcolor: darkMode ? 'neutral.900' : 'primary.500',
                boxShadow: 'md'
            }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    {/* Left side - Logo and mobile menu button */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            color="neutral"
                            variant="soft"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                            <StorefrontIcon sx={{ mr: 1, fontSize: 28 }} />
                            <Typography level="title-lg" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                                Nuggets Shop
                            </Typography>
                        </Link>
                    </Box>

                    {/* Center - Navigation Items */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
                        <Button component={Link} to="/" variant="plain" color="neutral">
                            Home
                        </Button>
                        <Button component={Link} to="/store" variant="plain" color="neutral">
                            Store
                        </Button>
                    </Box>

                    {/* Right side - Auth, Cart, and Theme */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!isLoggedIn ? (
                            <>
                                <Button
                                    component={Link}
                                    to="/signin"
                                    variant="plain"
                                    color="neutral"
                                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                                >
                                    Sign In
                                </Button>
                                <Button
                                    component={Link}
                                    to="/signup"
                                    variant="outlined"
                                    color="neutral"
                                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                                >
                                    Sign Up
                                </Button>
                            </>
                        ) : (
                            <>
                                <IconButton component={Link} to="/cart" variant="soft" color="neutral">
                                    <Badge badgeContent={cartCount} color="danger">
                                        <ShoppingCartIcon />
                                    </Badge>
                                </IconButton>
                                <IconButton
                                    onClick={handleProfileMenuOpen}
                                    size="md"
                                    variant="soft"
                                    color="neutral"
                                    aria-label="account menu"
                                    aria-controls={menuId}
                                >
                                    <Avatar size="sm" variant="outlined">
                                        {localStorage.getItem('username')?.charAt(0)?.toUpperCase() || 'U'}
                                    </Avatar>
                                </IconButton>
                            </>
                        )}
                        <DarkModeToggle />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', sm: 'none' } }}
            >
                {drawer}
            </Drawer>

            {renderMenu}
        </>
    );
}
