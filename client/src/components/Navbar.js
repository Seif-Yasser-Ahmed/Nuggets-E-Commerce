// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { getCartCount } from '../services/userService';
import { getGuestCart } from '../services/cartService';
import DarkModeToggle from './DarkModeToggle';
import {
    Typography,
    Button,
    IconButton,
    Badge,
    Avatar,
    Box,
    Drawer,
    List,
    ListItem,
    Divider
} from '@mui/joy';
import { AppBar, Toolbar, Popover, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';

export default function Navbar() {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [cartCount, setCartCount] = useState(0);
    const [username, setUsername] = useState('');

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

    // Check authentication status on component mount and when localStorage changes
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            const adminStatus = localStorage.getItem('isAdmin') === 'true';

            setIsLoggedIn(!!token && !!userId);
            setIsAdmin(adminStatus);
            setUsername(storedUsername || 'User');

            if (token && userId) {
                // Fetch real cart count from database for logged in user
                fetchCartCount(userId);
            } else {
                // Get cart count from localStorage for guest user
                getGuestCartCount();
            }
        };

        checkAuth();

        // Listen for storage events to update navbar when user logs in/out in another tab
        const handleStorageChange = () => {
            checkAuth();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
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

    // Listen for auth status changes
    useEffect(() => {
        // Create a function to handle auth status change events
        const handleAuthChange = () => {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');
            const storedUsername = localStorage.getItem('username');
            const adminStatus = localStorage.getItem('isAdmin') === 'true';

            setIsLoggedIn(!!token && !!userId);
            setIsAdmin(adminStatus);
            setUsername(storedUsername || 'User');

            if (token && userId) {
                fetchCartCount(userId);
            } else {
                getGuestCartCount();
            }
        };

        // Add event listener for auth status changes
        window.addEventListener('auth-status-changed', handleAuthChange);

        // Clean up event listener
        return () => {
            window.removeEventListener('auth-status-changed', handleAuthChange);
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
        // Clear auth data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userProfile');

        setIsLoggedIn(false);
        setIsAdmin(false);
        setUsername('');
        handleMenuClose();

        // Update cart count to show guest cart after logout
        getGuestCartCount();

        // Dispatch auth change event
        window.dispatchEvent(new CustomEvent('auth-status-changed'));

        navigate('/signin', { replace: true });
    };

    // Custom function to format the cart count badge
    const formatCartBadge = (count) => {
        if (count > 99) return "99+";
        return count;
    };

    // Custom badge styles for better display of larger numbers
    const badgeStyles = {
        minWidth: '20px',
        height: '20px',
        padding: '0 6px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const drawer = (
        <Box sx={{
            width: 250,
            p: 2,
            height: '100%',
            bgcolor: darkMode ? 'neutral.900' : 'background.surface',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorefrontIcon sx={{ mr: 1, fontSize: 28 }} />
                <Typography level="title-lg" sx={{ fontWeight: 'bold' }}>
                    Nuggets Shop
                </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <List sx={{ flexGrow: 1 }}>
                <ListItem>
                    <Button
                        component={Link}
                        to="/"
                        variant="plain"
                        color="neutral"
                        fullWidth
                        sx={{ justifyContent: 'flex-start' }}
                    >
                        Home
                    </Button>
                </ListItem>
                <ListItem>
                    <Button
                        component={Link}
                        to="/store"
                        variant="plain"
                        color="neutral"
                        fullWidth
                        startDecorator={<ShoppingBagIcon />}
                        sx={{ justifyContent: 'flex-start' }}
                    >
                        Store
                    </Button>
                </ListItem>

                {isLoggedIn ? (
                    <>
                        <ListItem>
                            <Button
                                component={Link}
                                to="/profile"
                                variant="plain"
                                color="neutral"
                                fullWidth
                                startDecorator={<PersonIcon />}
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                My Profile
                            </Button>
                        </ListItem>
                        <ListItem>
                            <Button
                                component={Link}
                                to="/cart"
                                variant="plain"
                                color="neutral"
                                fullWidth
                                startDecorator={
                                    <Badge
                                        badgeContent={formatCartBadge(cartCount)}
                                        color="danger"
                                        sx={{
                                            '& .MuiBadge-badge': badgeStyles
                                        }}
                                    >
                                        <ShoppingCartIcon />
                                    </Badge>
                                }
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                Cart
                            </Button>
                        </ListItem>

                        {isAdmin && (
                            <ListItem>
                                <Button
                                    component={Link}
                                    to="/admin/dashboard"
                                    variant="plain"
                                    color="neutral"
                                    fullWidth
                                    startDecorator={<DashboardIcon />}
                                    sx={{ justifyContent: 'flex-start' }}
                                >
                                    Admin Dashboard
                                </Button>
                            </ListItem>
                        )}
                    </>
                ) : (
                    <>
                        <ListItem>
                            <Button
                                component={Link}
                                to="/cart"
                                variant="plain"
                                color="neutral"
                                fullWidth
                                startDecorator={
                                    <Badge
                                        badgeContent={formatCartBadge(cartCount)}
                                        color="danger"
                                        sx={{
                                            '& .MuiBadge-badge': badgeStyles
                                        }}
                                    >
                                        <ShoppingCartIcon />
                                    </Badge>
                                }
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                Cart
                            </Button>
                        </ListItem>
                        <ListItem>
                            <Button
                                component={Link}
                                to="/signin"
                                variant="plain"
                                color="neutral"
                                fullWidth
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                Sign In
                            </Button>
                        </ListItem>
                        <ListItem>
                            <Button
                                component={Link}
                                to="/signup"
                                variant="plain"
                                color="neutral"
                                fullWidth
                                sx={{ justifyContent: 'flex-start' }}
                            >
                                Sign Up
                            </Button>
                        </ListItem>
                    </>
                )}
            </List>

            {isLoggedIn && (
                <Box sx={{ mt: 'auto', pt: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <Button
                        variant="soft"
                        color="danger"
                        onClick={handleLogout}
                        fullWidth
                        startDecorator={<LogoutIcon />}
                    >
                        Sign Out
                    </Button>
                </Box>
            )}

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <DarkModeToggle />
            </Box>
        </Box>
    );

    return (
        <>
            <AppBar
                position="sticky"
                color={darkMode ? "default" : "primary"}
                sx={{
                    py: 1,
                    bgcolor: darkMode ? 'neutral.900' : 'primary.500',
                    boxShadow: 'md',
                    zIndex: 1200,
                    color: darkMode ? '#ffffff' : 'inherit' // Ensure text is white in dark mode
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    {/* Left side - Logo and mobile menu button */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            variant="soft"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { sm: 'none' }, color: darkMode ? 'neutral.800' : 'default' }}
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
                        <IconButton
                            component={Link}
                            to="/cart"
                            variant="soft"
                            color="neutral"
                        >
                            <Badge
                                badgeContent={formatCartBadge(cartCount)}
                                color="danger"
                                sx={{
                                    '& .MuiBadge-badge': badgeStyles
                                }}
                            >
                                <ShoppingCartIcon />
                            </Badge>
                        </IconButton>

                        {isLoggedIn ? (
                            <IconButton
                                onClick={handleProfileMenuOpen}
                                size="sm"
                                variant="soft"
                                color="neutral"
                                aria-label="account menu"
                            >
                                <Avatar size="sm" variant="outlined">
                                    {username?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar>
                            </IconButton>
                        ) : (
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
                                <IconButton
                                    onClick={handleProfileMenuOpen}
                                    size="sm"
                                    variant="soft"
                                    color="neutral"
                                    aria-label="account menu"
                                    sx={{ display: { sm: 'none' } }}
                                >
                                    <AccountCircleIcon />
                                </IconButton>
                            </>
                        )}
                        <DarkModeToggle />
                    </Box>
                </Toolbar>
            </AppBar >

            {/* Mobile drawer */}
            < Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }
                }
                sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 } }}
            >
                {drawer}
            </Drawer >

            {/* Profile Menu - Using Popover instead of Menu for better positioning */}
            < Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleMenuClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                sx={{
                    mt: 1,
                    '& .MuiPopover-paper': {
                        boxShadow: '0px 5px 15px rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        minWidth: '200px'
                    },
                }}
            >
                {
                    isLoggedIn ? (
                        // Logged-in user menu
                        <Box sx={{ p: 1 }} >
                            <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Avatar
                                    size="md"
                                    variant="outlined"
                                    color="primary"
                                    sx={{ mx: 'auto', mb: 1 }}
                                >
                                    {username?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar>
                                <Typography level="title-sm">{username}</Typography>
                                {isAdmin && (
                                    <Typography level="body-xs" color="primary">Administrator</Typography>
                                )}
                            </Box>

                            <MenuItem
                                onClick={() => { handleMenuClose(); navigate('/profile'); }}
                                sx={{ py: 1.5 }}
                            >
                                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                                My Profile
                            </MenuItem>

                            {
                                isAdmin && (
                                    <MenuItem
                                        onClick={() => { handleMenuClose(); navigate('/admin/dashboard'); }}
                                        sx={{ py: 1.5 }}
                                    >
                                        <DashboardIcon sx={{ mr: 1, fontSize: 20 }} />
                                        Admin Dashboard
                                    </MenuItem>
                                )
                            }

                            <Divider />

                            <MenuItem
                                onClick={handleLogout}
                                sx={{ py: 1.5, color: 'danger.500' }}
                            >
                                <LogoutIcon sx={{ mr: 1, fontSize: 20 }} />
                                Sign Out
                            </MenuItem>
                        </Box >
                    ) : (
                        // Guest user menu (mobile only)
                        <Box sx={{ p: 1 }}>
                            <MenuItem
                                onClick={() => { handleMenuClose(); navigate('/signin'); }}
                                sx={{ py: 1.5 }}
                            >
                                <AccountCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                                Sign In
                            </MenuItem>
                            <MenuItem
                                onClick={() => { handleMenuClose(); navigate('/signup'); }}
                                sx={{ py: 1.5 }}
                            >
                                <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                                Sign Up
                            </MenuItem>
                        </Box>
                    )}
            </Popover >
        </>
    );
}
