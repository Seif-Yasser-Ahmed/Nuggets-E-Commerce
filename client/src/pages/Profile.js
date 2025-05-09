// client/src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/authService';
import { getUserOrders } from '../services/orderService';
import { getWishlist, removeFromWishlist } from '../services/userService';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { formatImageUrl, getPlaceholderImage } from '../utils/imageUtils';
import {
    Box,
    Container,
    Grid,
    Avatar,
    Typography,
    Card,
    CardContent,
    Divider,
    Button,
    IconButton,
    Input,
    Tabs,
    TabList,
    Tab,
    TabPanel,
    List,
    ListItem,
    ListItemDecorator,
    CircularProgress,
    Chip,
    AspectRatio,
    Alert,
    Modal,
    CardOverflow
} from '@mui/joy';
import {
    Edit as EditIcon,
    LocationOn as LocationIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Work as WorkIcon,
    Cake as BirthdayIcon,
    GitHub as GitHubIcon,
    LinkedIn as LinkedInIcon,
    Twitter as TwitterIcon,
    Instagram as InstagramIcon,
    Facebook as FacebookIcon,
    Language as WebsiteIcon,
    AddAPhoto as AddPhotoIcon,
    History as HistoryIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    ShoppingCart as CartIcon,
    AccountCircle as AccountIcon,
    Delete as DeleteIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import API from '../services/api';

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [socialLinks, setSocialLinks] = useState({});
    const [editingSocial, setEditingSocial] = useState(false);
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Delete account modal state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    const [orderHistory, setOrderHistory] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        severity: 'success'
    });

    // Modal state for order details
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            setErrorMsg('No user ID found. Please sign in.');
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            try {
                setLoading(true);
                const response = await getProfile(storedUserId);
                console.log("Profile data from server:", response.data.data);

                // Add detailed logging
                console.log("Telephone from server:", response.data.data.telephone);
                console.log("Phone from server:", response.data.data.phone);
                console.log("All available fields:", Object.keys(response.data.data));

                // Get API base URL from the API service - but strip off the /api/v1 part
                const apiBaseUrl = API.defaults.baseURL ? API.defaults.baseURL.split('/api/v1')[0] : '';                // Ensure the profile image path is properly constructed
                // The field in the DB is personal_image, not profile_image
                const profileImagePath = response.data.data.personal_image || '';

                console.log("Personal image from server:", profileImagePath);

                // Use the formatImageUrl utility to properly format the image URL
                const fullProfileImage = formatImageUrl(profileImagePath);

                console.log("Formatted profile image URL:", fullProfileImage);

                console.log("Full profile image URL:", fullProfileImage); const userData = {
                    ...response.data.data,
                    // Map database fields to frontend fields
                    firstName: response.data.data.first_name || 'John',
                    lastName: response.data.data.last_name || 'Doe',
                    first_name: response.data.data.first_name || 'John', // Keep original fields too
                    last_name: response.data.data.last_name || 'Doe',    // Keep original fields too
                    email: response.data.data.email || '',
                    profileImage: fullProfileImage,  // For backward compatibility
                    personal_image: response.data.data.personal_image || '', // The actual DB field
                    phone: response.data.data.telephone || '', // Map telephone to phone for frontend
                    telephone: response.data.data.telephone || '', // Keep original field
                    location: response.data.data.location || '',
                    bio: response.data.data.bio || 'No bio information provided.',
                    occupation: response.data.data.occupation || '',
                    birthday: response.data.data.birthday || '',
                    memberSince: response.data.data.created_at
                        ? new Date(response.data.data.created_at).toLocaleDateString()
                        : new Date().toLocaleDateString()
                };

                setUser(userData);
                setEditedUser(userData);

                // Parse social links
                const userSocialLinks = response.data.data.social_links || {};
                setSocialLinks({
                    website: userSocialLinks.website || '',
                    github: userSocialLinks.github || '',
                    linkedin: userSocialLinks.linkedin || '',
                    twitter: userSocialLinks.twitter || '',
                    instagram: userSocialLinks.instagram || '',
                    facebook: userSocialLinks.facebook || ''
                });

                fetchOrderHistory(storedUserId);
                fetchWishlist(storedUserId);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setErrorMsg('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const fetchOrderHistory = async (userId) => {
        try {
            setOrdersLoading(true);
            const response = await getUserOrders(userId);

            console.log("User orders response:", response);

            if (response && response.data) {
                const orders = Array.isArray(response.data) ? response.data : response.data.data;
                if (orders && orders.length > 0) {
                    setOrderHistory(orders.map(order => ({
                        id: order._id || order.id,
                        date: order.created_at || order.date,
                        items: order.items ? order.items.length : 0,
                        status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
                        total: order.total_amount || 0
                    })));
                    console.log("Processed order history:", orderHistory);
                } else {
                    console.log("No orders found in response");
                    setOrderHistory([]);
                }
            } else {
                console.log("Invalid response structure:", response);
                setOrderHistory([]);
            }
        } catch (error) {
            console.error('Error fetching order history:', error);
            setOrderHistory([]);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchWishlist = async (userId) => {
        try {
            setWishlistLoading(true);
            const response = await getWishlist(userId);

            if (response.data && response.data.data) {
                setWishlistItems(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleEditProfile = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedUser(user);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser({
            ...editedUser,
            [name]: value
        });
    };

    const handleSocialInputChange = (e) => {
        const { name, value } = e.target;
        setSocialLinks({
            ...socialLinks,
            [name]: value
        });
    };

    const handleEditSocialLinks = () => {
        setEditingSocial(true);
    };

    const handleSaveSocialLinks = async () => {
        try {
            const storedUserId = localStorage.getItem('userId');
            await API.put(`/users/${storedUserId}/social`, { socialLinks });

            setEditingSocial(false);
            showNotification('Social links updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating social links:', error);
            showNotification('Failed to update social links.', 'error');
        }
    };

    const handleCancelSocialEdit = () => {
        setEditingSocial(false);
    };

    const handleSaveProfile = async () => {
        try {
            const storedUserId = localStorage.getItem('userId');

            // Format birthday properly if it exists
            let formattedBirthday = null;
            if (editedUser.birthday) {
                // Check if the birthday already has the ISO format with 'T'
                if (editedUser.birthday.includes('T')) {
                    formattedBirthday = editedUser.birthday.split('T')[0]; // Extract just the date part
                } else {
                    formattedBirthday = editedUser.birthday;
                }
            } const profileData = {
                first_name: editedUser.firstName || editedUser.first_name,
                last_name: editedUser.lastName || editedUser.last_name,
                email: editedUser.email,
                telephone: editedUser.phone || editedUser.telephone, // Map phone to telephone for database compatibility
                location: editedUser.location,
                bio: editedUser.bio,
                occupation: editedUser.occupation,
                birthday: formattedBirthday,
                personal_image: editedUser.personal_image // Preserve the personal_image field
            };

            await API.put(`/users/${storedUserId}`, profileData);            // Update the local user state with edited values
            setUser({
                ...user,
                first_name: editedUser.firstName || editedUser.first_name,
                last_name: editedUser.lastName || editedUser.last_name,
                firstName: editedUser.firstName || editedUser.first_name,
                lastName: editedUser.lastName || editedUser.last_name,
                email: editedUser.email,
                phone: editedUser.phone || editedUser.telephone,
                telephone: editedUser.phone || editedUser.telephone,
                location: editedUser.location,
                bio: editedUser.bio,
                occupation: editedUser.occupation,
                birthday: formattedBirthday,
                personal_image: editedUser.personal_image, // Preserve the personal_image field
                profileImage: editedUser.profileImage // Also preserve the profileImage field for backward compatibility
            });

            setIsEditing(false);
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile.', 'error');
        }
    };    // Fetch order details for the selected order
    const fetchOrderDetails = async (orderId) => {
        try {
            setOrderDetailsLoading(true);
            setSelectedOrder(orderId);
            setOrderModalOpen(true);

            // Get order details
            const response = await API.get(`/orders/${orderId}`);

            if (response.data && response.data.success) {
                setOrderDetails(response.data.data);
            } else {
                showNotification('Failed to fetch order details.', 'error');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            showNotification('Failed to fetch order details.', 'error');
        } finally {
            setOrderDetailsLoading(false);
        }
    };

    // Close the order details modal
    const handleCloseOrderModal = () => {
        setOrderModalOpen(false);
        setSelectedOrder(null);
        setOrderDetails(null);
    };

    const showNotification = (message, severity) => {
        setNotification({
            show: true,
            message,
            severity
        });

        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    }; const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        setUploadingImage(true);

        reader.onload = async (event) => {
            try {
                const storedUserId = localStorage.getItem('userId');
                const formData = new FormData();
                formData.append('image', file);

                const response = await API.post(`/users/${storedUserId}/profile-image`, formData);

                // Get the server URL for the saved image
                const serverImageUrl = response.data.data.imageUrl;
                console.log("Server image URL from upload response:", serverImageUrl);

                // Use the formatImageUrl utility to properly format the image URL
                const fullImageUrl = formatImageUrl(serverImageUrl);
                console.log("Formatted image URL after upload:", fullImageUrl);

                console.log("New profile image URL:", fullImageUrl);
                setEditedUser({
                    ...editedUser,
                    personal_image: serverImageUrl,
                    profileImage: fullImageUrl  // Keep for backwards compatibility
                });

                if (!isEditing) {
                    setUser({
                        ...user,
                        personal_image: serverImageUrl,
                        profileImage: fullImageUrl  // Keep for backwards compatibility
                    });
                }

                showNotification('Profile image updated successfully!', 'success');
            } catch (error) {
                console.error('Error uploading image:', error);
                showNotification('Failed to upload image.', 'error');
            } finally {
                setUploadingImage(false);
            }
        };

        reader.readAsDataURL(file);
    }; const handleRemoveFromWishlist = async (productId) => {
        try {
            const storedUserId = localStorage.getItem('userId');
            await removeFromWishlist(storedUserId, productId);

            // Update the wishlist items - check all possible ID fields
            setWishlistItems(wishlistItems.filter(item => {
                const itemId = item._id || item.id || item.product_id;
                return itemId !== productId;
            }));
            showNotification('Item removed from wishlist.', 'success');

            // Dispatch event to update wishlist state across all components
            window.dispatchEvent(new CustomEvent('wishlist-updated'));
        } catch (error) {
            console.error('Error removing item from wishlist:', error);
            showNotification('Failed to remove item from wishlist.', 'error');
        }
    };

    const handleAddToCart = async (item) => {
        try {
            const storedUserId = localStorage.getItem('userId');

            // Import the cart service's addToCart function
            const { addToCart } = await import('../services/cartService');

            // Use the cart service that properly handles IDs
            const response = await addToCart({
                userId: storedUserId,
                productId: item._id || item.id, // Use either _id or id depending on what's available
                quantity: 1
            });

            if (response.success || response.data?.success) {
                showNotification('Item added to cart!', 'success');

                // Dispatch event to update cart count in navbar
                window.dispatchEvent(new CustomEvent('cart-updated'));
            } else {
                showNotification('Failed to add item to cart.', 'error');
            }
        } catch (error) {
            console.error('Error adding item to cart:', error);
            showNotification('Failed to add item to cart.', 'error');
        }
    };

    // Password change handler
    const handlePasswordChange = async () => {
        setPasswordError('');
        setChangingPassword(true);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New password and confirmation do not match.');
            setChangingPassword(false);
            return;
        }

        try {
            const storedUserId = localStorage.getItem('userId');
            await API.put(`/users/${storedUserId}/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            showNotification('Password changed successfully!', 'success');

            // Clear password fields
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError('Failed to change password. Please try again.');
        } finally {
            setChangingPassword(false);
        }
    };

    // Delete account handler
    const handleDeleteAccount = async () => {
        setDeletingAccount(true);

        try {
            const storedUserId = localStorage.getItem('userId');
            const username = user.username;

            // Call the API to delete the user account
            await API.delete(`/users/${storedUserId}`);

            // Show success notification
            showNotification(`Account for ${username} deleted successfully.`, 'success');

            // Log the user out by clearing all authentication data
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            localStorage.removeItem('isAdmin');
            localStorage.removeItem('userProfile');

            // Dispatch auth change event to update UI components like the navbar
            window.dispatchEvent(new CustomEvent('auth-status-changed'));

            // Redirect to home page
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Error deleting account:', error);
            showNotification('Failed to delete account. Please try again.', 'error');
            setDeleteConfirmOpen(false);
        } finally {
            setDeletingAccount(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80vh'
                }}
            >
                <CircularProgress size="lg" />
            </Box>
        );
    }

    if (errorMsg) {
        return (
            <Container
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '80vh',
                    textAlign: 'center'
                }}
            >
                <Typography level="h4" color="danger" sx={{ mb: 2 }}>
                    {errorMsg}
                </Typography>
                <Button
                    variant="solid"
                    color="primary"
                    onClick={() => navigate('/signin')}
                >
                    Go to Sign In
                </Button>
            </Container>
        );
    }

    return (
        <Box
            sx={{
                bgcolor: darkMode ? 'neutral.900' : 'neutral.50',
                minHeight: '100vh',
                py: 4,
                color: darkMode ? 'white' : 'inherit'
            }}
        >
            {notification.show && (
                <Alert
                    color={notification.severity}
                    variant="soft"
                    sx={{
                        position: 'fixed',
                        top: 80,
                        right: 16,
                        zIndex: 9999,
                        maxWidth: 400
                    }}
                    endDecorator={
                        <IconButton variant="plain" size="sm" color="neutral" onClick={() => setNotification({ ...notification, show: false })}>
                            <CloseIcon />
                        </IconButton>
                    }
                >
                    {notification.message}
                </Alert>
            )}

            <Container maxWidth="lg">
                <Grid container spacing={4}>
                    {/* Left Column - User Info */}
                    <Grid xs={12} md={4}>
                        <Card
                            sx={{
                                textAlign: 'center',
                                mb: { xs: 2, md: 4 },
                                bgcolor: darkMode ? 'neutral.800' : 'white',
                                color: darkMode ? 'white' : 'inherit'
                            }}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>                                <Box sx={{ position: 'relative', mb: 2 }}>
                                {console.log("Profile image URL being used:", isEditing
                                    ? (editedUser.personal_image || editedUser.profileImage)
                                    : (user.personal_image || user.profileImage))}
                                <Avatar
                                    src={formatImageUrl(isEditing
                                        ? (editedUser.personal_image || editedUser.profileImage)
                                        : (user.personal_image || user.profileImage)
                                    )}
                                    alt={user.username}
                                    sx={{
                                        width: 120,
                                        height: 120,
                                        border: '4px solid',
                                        borderColor: 'primary.500',
                                        bgcolor: (user.personal_image || user.profileImage) ? 'transparent' : 'primary.500',
                                        fontSize: '48px'
                                    }}
                                >
                                    {user.username ? user.username.charAt(0).toLowerCase() : 's'}
                                </Avatar>
                                {(isEditing || !user.profileImage) && (
                                    <IconButton
                                        component="label"
                                        color="primary"
                                        variant="soft"
                                        size="sm"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            borderRadius: '50%'
                                        }}
                                    >
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        {uploadingImage ? <CircularProgress size="sm" /> : <AddPhotoIcon />}
                                    </IconButton>
                                )}
                            </Box>

                                <Typography level="h4" sx={{ fontWeight: 'bold', mb: 0.5, color: darkMode ? 'white' : 'inherit' }}>
                                    {isEditing ? (
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Input
                                                placeholder="First Name"
                                                name="firstName"
                                                value={editedUser.firstName || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                            />
                                            <Input
                                                placeholder="Last Name"
                                                name="lastName"
                                                value={editedUser.lastName || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                            />
                                        </Box>
                                    ) : (
                                        `${user.firstName} ${user.lastName}`
                                    )}
                                </Typography>

                                <Typography level="body-sm" sx={{ mb: 2, color: darkMode ? 'neutral.300' : 'neutral.600' }}>
                                    @{user.username}
                                </Typography>

                                {isEditing ? (
                                    <Input
                                        placeholder="About me"
                                        name="bio"
                                        value={editedUser.bio || ''}
                                        onChange={handleInputChange}
                                        multiline
                                        minRows={2}
                                        sx={{ mb: 2, width: '100%' }}
                                    />
                                ) : (
                                    <Typography level="body-md" sx={{ mb: 2, color: darkMode ? 'white' : 'inherit' }}>
                                        {user.bio}
                                    </Typography>
                                )}

                                {isEditing ? (
                                    <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'center', mb: 2 }}>
                                        <Button
                                            variant="soft"
                                            color="danger"
                                            onClick={handleCancelEdit}
                                            sx={{ flexGrow: 1 }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="solid"
                                            color="primary"
                                            onClick={handleSaveProfile}
                                            sx={{ flexGrow: 1 }}
                                        >
                                            Save
                                        </Button>
                                    </Box>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        color="neutral"
                                        startDecorator={<EditIcon />}
                                        onClick={handleEditProfile}
                                        sx={{ mb: 2 }}
                                    >
                                        Edit Profile
                                    </Button>
                                )}

                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    <Chip color="primary" size="sm">
                                        Member since {user.memberSince}
                                    </Chip>
                                </Box>
                            </CardContent>
                        </Card>

                        <Card sx={{
                            mb: { xs: 2, md: 0 },
                            bgcolor: darkMode ? 'neutral.800' : 'white',
                            color: darkMode ? 'white' : 'inherit'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography level="title-md" sx={{ color: darkMode ? 'white' : 'inherit' }}>Personal Information</Typography>
                                    {!isEditing && (
                                        <IconButton size="sm" variant="plain" color={darkMode ? 'neutral' : 'neutral'} onClick={handleEditProfile}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </Box>

                                <List size="sm">
                                    <ListItem>
                                        <ListItemDecorator>
                                            <EmailIcon color={darkMode ? 'primary' : 'inherit'} />
                                        </ListItemDecorator>
                                        {isEditing ? (
                                            <Input
                                                placeholder="Email"
                                                name="email"
                                                value={editedUser.email || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                                sx={{ flexGrow: 1 }}
                                            />
                                        ) : (
                                            <Typography level="body-md" sx={{ color: darkMode ? 'white' : 'inherit' }}>
                                                {user.email || 'No email provided'}
                                            </Typography>
                                        )}
                                    </ListItem>

                                    <ListItem>
                                        <ListItemDecorator>
                                            <PhoneIcon color={darkMode ? 'primary' : 'inherit'} />
                                        </ListItemDecorator>
                                        {isEditing ? (
                                            <Input
                                                placeholder="Phone"
                                                name="phone"
                                                value={editedUser.phone || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                                sx={{ flexGrow: 1 }}
                                            />
                                        ) : (
                                            <Typography level="body-md" sx={{ color: darkMode ? 'white' : 'inherit' }}>
                                                {user.phone || 'No phone provided'}
                                            </Typography>
                                        )}
                                    </ListItem>

                                    <ListItem>
                                        <ListItemDecorator>
                                            <LocationIcon color={darkMode ? 'primary' : 'inherit'} />
                                        </ListItemDecorator>
                                        {isEditing ? (
                                            <Input
                                                placeholder="Location"
                                                name="location"
                                                value={editedUser.location || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                                sx={{ flexGrow: 1 }}
                                            />
                                        ) : (
                                            <Typography level="body-md" sx={{ color: darkMode ? 'white' : 'inherit' }}>
                                                {user.location || 'No location provided'}
                                            </Typography>
                                        )}
                                    </ListItem>

                                    <ListItem>
                                        <ListItemDecorator>
                                            <WorkIcon color={darkMode ? 'primary' : 'inherit'} />
                                        </ListItemDecorator>
                                        {isEditing ? (
                                            <Input
                                                placeholder="Occupation"
                                                name="occupation"
                                                value={editedUser.occupation || ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                                sx={{ flexGrow: 1 }}
                                            />
                                        ) : (
                                            <Typography level="body-md" sx={{ color: darkMode ? 'white' : 'inherit' }}>
                                                {user.occupation || 'No occupation provided'}
                                            </Typography>
                                        )}
                                    </ListItem>

                                    <ListItem>
                                        <ListItemDecorator>
                                            <BirthdayIcon color={darkMode ? 'primary' : 'inherit'} />
                                        </ListItemDecorator>
                                        {isEditing ? (
                                            <Input
                                                type="date"
                                                placeholder="Birthday"
                                                name="birthday"
                                                value={editedUser.birthday ? editedUser.birthday.split('T')[0] : ''}
                                                onChange={handleInputChange}
                                                size="sm"
                                                sx={{ flexGrow: 1 }}
                                            />
                                        ) : (
                                            <Typography level="body-md" sx={{ color: darkMode ? 'white' : 'inherit' }}>
                                                {user.birthday ?
                                                    new Date(user.birthday).toLocaleDateString() :
                                                    'No birthday provided'
                                                }
                                            </Typography>
                                        )}
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column - Social Links and Tabs */}
                    <Grid xs={12} md={8}>
                        {/* Social Links */}
                        <Card sx={{
                            mb: 3,
                            bgcolor: darkMode ? 'neutral.800' : 'white',
                            color: darkMode ? 'white' : 'inherit'
                        }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography level="title-md" sx={{ color: darkMode ? 'white' : 'inherit' }}>Social Media</Typography>
                                    {!editingSocial && (
                                        <IconButton size="sm" variant="plain" color={darkMode ? 'neutral' : 'neutral'} onClick={handleEditSocialLinks}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </Box>

                                <Grid container spacing={2}>
                                    {editingSocial ? (
                                        <>
                                            <Grid xs={12} sm={6}>
                                                <Input
                                                    sx={{ bgcolor: darkMode ? 'neutral.800' : 'default' }}
                                                    name="website"
                                                    label="Website"
                                                    value={socialLinks.website || ''}
                                                    onChange={handleSocialInputChange}
                                                    fullWidth
                                                    size="sm"
                                                    placeholder="https://example.com"
                                                    startDecorator={<WebsiteIcon />}
                                                />
                                            </Grid>
                                            <Grid xs={12} sm={6}>
                                                <Input
                                                    sx={{ bgcolor: darkMode ? 'neutral.800' : 'default' }}
                                                    name="github"
                                                    label="GitHub"
                                                    value={socialLinks.github || ''}
                                                    onChange={handleSocialInputChange}
                                                    fullWidth
                                                    size="sm"
                                                    placeholder="https://github.com/username"
                                                    startDecorator={<GitHubIcon />}
                                                />
                                            </Grid>
                                            <Grid xs={12} sm={6}>
                                                <Input
                                                    sx={{ bgcolor: darkMode ? 'neutral.800' : 'default' }}
                                                    name="linkedin"
                                                    label="LinkedIn"
                                                    value={socialLinks.linkedin || ''}
                                                    onChange={handleSocialInputChange}
                                                    fullWidth
                                                    size="sm"
                                                    placeholder="https://linkedin.com/in/username"
                                                    startDecorator={<LinkedInIcon />}
                                                />
                                            </Grid>
                                            <Grid xs={12} sm={6}>
                                                <Input
                                                    sx={{ bgcolor: darkMode ? 'neutral.800' : 'default' }}
                                                    name="twitter"
                                                    label="Twitter"
                                                    value={socialLinks.twitter || ''}
                                                    onChange={handleSocialInputChange}
                                                    fullWidth
                                                    size="sm"
                                                    placeholder="https://twitter.com/username"
                                                    startDecorator={<TwitterIcon />}
                                                />
                                            </Grid>
                                            <Grid xs={12} sm={6}>
                                                <Input
                                                    sx={{ bgcolor: darkMode ? 'neutral.800' : 'default' }}
                                                    name="instagram"
                                                    label="Instagram"
                                                    value={socialLinks.instagram || ''}
                                                    onChange={handleSocialInputChange}
                                                    fullWidth
                                                    size="sm"
                                                    placeholder="https://instagram.com/username"
                                                    startDecorator={<InstagramIcon />}
                                                />
                                            </Grid>
                                            <Grid xs={12} sm={6}>
                                                <Input
                                                    sx={{ bgcolor: darkMode ? 'neutral.800' : 'default' }}
                                                    name="facebook"
                                                    label="Facebook"
                                                    value={socialLinks.facebook || ''}
                                                    onChange={handleSocialInputChange}
                                                    fullWidth
                                                    size="sm"
                                                    placeholder="https://facebook.com/username"
                                                    startDecorator={<FacebookIcon />}
                                                />
                                            </Grid>
                                            <Grid xs={12}>
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
                                                    <Button
                                                        variant="soft"
                                                        color="danger"
                                                        onClick={handleCancelSocialEdit}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        variant="solid"
                                                        color="primary"
                                                        onClick={handleSaveSocialLinks}
                                                    >
                                                        Save
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        </>
                                    ) : (
                                        <>
                                            {Object.entries(socialLinks).map(([key, value]) => (
                                                value && (
                                                    <Grid xs={6} sm={4} md={2} key={key}>
                                                        <a
                                                            href={value.startsWith('http') ? value : `https://${value}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ textDecoration: 'none', display: 'block', width: '100%' }}
                                                        >
                                                            <Button
                                                                variant="soft"
                                                                color={darkMode ? 'neutral.600' : 'neutral'}
                                                                fullWidth
                                                                sx={{
                                                                    transition: 'all 0.2s ease',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-2px)',
                                                                        boxShadow: darkMode ? '0 4px 8px rgba(0,0,0,0.5)' : '0 4px 8px rgba(0,0,0,0.1)'
                                                                    }
                                                                }}
                                                                startDecorator={
                                                                    key === 'website' ? <WebsiteIcon /> :
                                                                        key === 'github' ? <GitHubIcon /> :
                                                                            key === 'linkedin' ? <LinkedInIcon /> :
                                                                                key === 'twitter' ? <TwitterIcon /> :
                                                                                    key === 'instagram' ? <InstagramIcon /> :
                                                                                        <FacebookIcon />
                                                                }
                                                            >
                                                                <Typography level="body-xs" noWrap sx={{ color: darkMode ? 'white' : 'inherit' }}>
                                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                                </Typography>
                                                            </Button>
                                                        </a>
                                                    </Grid>
                                                )
                                            ))}
                                            {!Object.values(socialLinks).some(value => value) && (
                                                <Grid xs={12}>
                                                    <Typography level="body-sm" sx={{ textAlign: 'center', color: darkMode ? 'neutral.400' : 'neutral.600' }}>
                                                        No social links added yet. Click the edit button to add some.
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Activity Tabs */}
                        <Card sx={{
                            bgcolor: darkMode ? 'neutral.700' : 'neutral',
                            color: darkMode ? 'white' : 'inherit'
                        }}>
                            <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} sx={{ borderRadius: 'lg' }}>
                                <TabList sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: darkMode ? 'neutral.800' : 'white' }}>
                                    <Tab
                                        variant={activeTab === 0 ? "soft" : "plain"}
                                        color={activeTab === 0 ? "primary" : darkMode ? "neutral" : "neutral"}
                                        startDecorator={<HistoryIcon />}
                                    >
                                        <Typography color={darkMode ? 'white' : 'inherit'}>
                                            Order History
                                        </Typography>
                                    </Tab>
                                    <Tab
                                        variant={activeTab === 1 ? "soft" : "plain"}
                                        color={activeTab === 1 ? "primary" : darkMode ? "neutral" : "neutral"}
                                        startDecorator={<FavoriteIcon />}
                                    >
                                        <Typography color={darkMode ? 'white' : 'inherit'}>
                                            Wishlist
                                        </Typography>
                                    </Tab>
                                    <Tab
                                        variant={activeTab === 2 ? "soft" : "plain"}
                                        color={activeTab === 2 ? "primary" : darkMode ? "neutral" : "neutral"}
                                        startDecorator={<AccountIcon />}
                                    >
                                        <Typography color={darkMode ? 'white' : 'inherit'}>
                                            Account Settings
                                        </Typography>
                                    </Tab>
                                </TabList>

                                <TabPanel value={0} sx={{ p: 2, bgcolor: darkMode ? 'neutral.900' : 'white' }}>
                                    <Typography level="title-md" sx={{ mb: 2, color: darkMode ? 'white' : 'inherit' }}>Recent Orders</Typography>
                                    {ordersLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : orderHistory.length > 0 ? (
                                        <Grid container spacing={2}>
                                            {orderHistory.map((order) => (
                                                <Grid key={order.id} xs={12}>
                                                    <Card
                                                        variant="outlined"
                                                        orientation="horizontal"
                                                        sx={{
                                                            gap: 2,
                                                            mb: 1,
                                                            bgcolor: darkMode ? 'neutral.900' : 'white',
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}>
                                                                <Typography level="title-sm" sx={{ color: darkMode ? 'white' : 'inherit' }}>
                                                                    Order #{order.id}
                                                                </Typography>
                                                                <Chip
                                                                    size="sm"
                                                                    variant="soft"
                                                                    color={
                                                                        order.status === 'Delivered' ? 'success' :
                                                                            order.status === 'Processing' ? 'primary' :
                                                                                'warning'
                                                                    }
                                                                >
                                                                    {order.status}
                                                                </Chip>
                                                            </Box>
                                                            <Typography level="body-sm" sx={{ color: darkMode ? 'neutral.400' : 'neutral.600' }}>
                                                                {new Date(order.date).toLocaleDateString()}
                                                                {' • '}
                                                                {order.items} item{order.items !== 1 ? 's' : ''}
                                                                {console.log(order)}
                                                            </Typography>
                                                            <Box sx={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                mt: 1
                                                            }}>
                                                                <Typography level="body-md" fontWeight="bold" sx={{ color: darkMode ? 'white' : 'inherit' }}>
                                                                    ${parseFloat(order.total).toFixed(2)}
                                                                </Typography>
                                                                <Button
                                                                    size="sm"
                                                                    variant="plain"
                                                                    color="primary"
                                                                    sx={{ fontSize: 'xs' }}
                                                                    onClick={() => {
                                                                        fetchOrderDetails(order.id);
                                                                    }}
                                                                >
                                                                    View Details
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Typography level="body-md" sx={{ textAlign: 'center', py: 4, color: darkMode ? 'neutral.400' : 'neutral.600' }}>
                                            No orders yet. Start shopping!
                                        </Typography>
                                    )}
                                </TabPanel>

                                <TabPanel value={1} sx={{ p: 2, bgcolor: darkMode ? 'neutral.900' : 'white' }}>
                                    <Typography level="title-md" sx={{ mb: 2, color: darkMode ? 'white' : 'inherit' }}>Your Wishlist</Typography>
                                    {wishlistLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : wishlistItems.length > 0 ? (
                                        <Grid container spacing={2}>
                                            {console.log(wishlistItems)}
                                            {wishlistItems.map((item) => (
                                                <Grid key={item.id} xs={12} sm={6}>
                                                    <Card
                                                        variant="outlined"
                                                        onClick={() => navigate(`/item/${item.id}`)}
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            gap: 2,
                                                            bgcolor: darkMode ? 'neutral.900' : 'white',
                                                            position: 'relative',
                                                            '&:hover': {
                                                                borderColor: 'primary.500',
                                                                cursor: 'pointer'
                                                            }
                                                        }}
                                                    ><AspectRatio ratio="1/1" sx={{ width: 90 }}>                                                            <img
                                                        src={formatImageUrl(
                                                            Array.isArray(item.images) && item.images.length > 0
                                                                ? item.images[0]
                                                                : (item.image_url || item.image || '')
                                                        )}
                                                        loading="lazy"
                                                        alt={item.name}
                                                        style={{ objectFit: 'cover' }} onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = getPlaceholderImage();
                                                        }}
                                                    />
                                                        </AspectRatio>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, py: 1, pr: 2 }}>
                                                            <Box onClick={() => navigate(`/item/${item.id}`)} sx={{ flex: 1 }}>
                                                                <Typography level="title-sm" sx={{ color: darkMode ? 'white' : 'inherit' }}>
                                                                    {item.name}
                                                                </Typography>
                                                                <Typography level="body-xs" sx={{ color: darkMode ? 'success.400' : 'success.600' }}>
                                                                    ${parseFloat(item.price).toFixed(2)}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', mt: 'auto', gap: 1, justifyContent: 'flex-end' }}>
                                                                <IconButton
                                                                    size="sm"
                                                                    variant="plain"
                                                                    color="danger"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveFromWishlist(item.id);
                                                                    }}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                                <Button
                                                                    size="sm"
                                                                    variant="soft"
                                                                    color="primary"
                                                                    startDecorator={<CartIcon />}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleAddToCart(item);
                                                                    }}
                                                                >
                                                                    Add to Cart
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Typography level="body-md" sx={{ textAlign: 'center', py: 4, color: darkMode ? 'neutral.400' : 'neutral.600' }}>
                                            Your wishlist is empty. Find something you like!
                                        </Typography>
                                    )}
                                </TabPanel>

                                <TabPanel value={2} sx={{ p: 2, bgcolor: darkMode ? 'neutral.900' : 'white' }}>
                                    <Typography level="title-md" sx={{ mb: 3, color: darkMode ? 'white' : 'inherit' }}>Account Settings</Typography>

                                    <Box sx={{ mb: 4 }}>
                                        <Typography level="title-sm" sx={{ mb: 2, color: darkMode ? 'white' : 'inherit' }}>Change Password</Typography>
                                        <Grid container spacing={2}>
                                            <Grid xs={12}>
                                                <Input
                                                    sx={{ bgcolor: darkMode ? 'neutral.800' : 'default' }}
                                                    type="password"
                                                    label="Current Password"
                                                    size="sm"
                                                    fullWidth
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid xs={12} sm={6}>
                                                <Input
                                                    sx={{ bgcolor: darkMode ? 'neutral.800' : 'default' }}
                                                    type="password"
                                                    label="New Password"
                                                    size="sm"
                                                    fullWidth
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid xs={12} sm={6}>
                                                <Input
                                                    sx={{ bgcolor: darkMode ? 'neutral.800' : 'default' }}
                                                    type="password"
                                                    label="Confirm New Password"
                                                    size="sm"
                                                    fullWidth
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid xs={12}>
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                                    <Button
                                                        variant="solid"
                                                        color="primary"
                                                        size="sm"
                                                        onClick={handlePasswordChange}
                                                        disabled={changingPassword}
                                                    >
                                                        {changingPassword ? <CircularProgress size="sm" /> : 'Update Password'}
                                                    </Button>
                                                </Box>
                                                {passwordError && (
                                                    <Typography level="body-sm" sx={{ color: 'danger.500', mt: 1, textAlign: 'right' }}>
                                                        {passwordError}
                                                    </Typography>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Divider sx={{ my: 3 }} />

                                    <Box sx={{ mb: 4 }}>
                                        <Typography level="title-sm" sx={{ mb: 2, color: 'danger.500' }}>Danger Zone</Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Button
                                                variant="outlined"
                                                color="danger"
                                                size="sm"
                                                onClick={() => setDeleteConfirmOpen(true)}
                                            >
                                                Delete Account
                                            </Button>
                                            <Button
                                                variant="plain"
                                                color="danger"
                                                size="sm"
                                            >
                                                Log Out from All Devices
                                            </Button>
                                        </Box>
                                    </Box>
                                </TabPanel>
                            </Tabs>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <OrderDetailsModal
                open={orderModalOpen}
                onClose={handleCloseOrderModal}
                order={orderDetails}
                loading={orderDetailsLoading}
            />

            {/* Delete Account Confirmation Modal */}
            <Modal
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Card
                    variant="outlined"
                    sx={{
                        maxWidth: 400,
                        width: '90%',
                        bgcolor: darkMode ? 'neutral.900' : 'white',
                        color: darkMode ? 'white' : 'inherit',
                        boxShadow: 'lg',
                    }}
                >
                    <CardContent>
                        <Typography level="h5" sx={{ mb: 2, color: darkMode ? 'primary.200' : 'inherit' }}>
                            Delete Account
                        </Typography>
                        <Typography level="body-sm" sx={{ mb: 3, color: darkMode ? 'neutral.400' : 'neutral.600' }}>
                            Are you sure you want to delete your account? This action is irreversible.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="soft"
                                color="danger"
                                onClick={() => setDeleteConfirmOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="solid"
                                color="danger"
                                onClick={handleDeleteAccount}
                                loading={deletingAccount}
                            >
                                {deletingAccount ? <CircularProgress size="sm" /> : 'Delete Account'}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Modal>
        </Box>
    );
}

// Order Details Modal Component
function OrderDetailsModal({ open, onClose, order, loading }) {
    const { darkMode } = useTheme();

    if (!order && !loading) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Card
                variant="outlined"
                sx={{
                    maxWidth: 600,
                    maxHeight: '90vh',
                    width: '90%',
                    overflowY: 'auto',
                    bgcolor: darkMode ? 'neutral.900' : 'background.paper',
                    boxShadow: 'lg',
                }}
            >
                <Box
                    sx={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                        // pick a truly opaque surface color from your theme
                        bgcolor: darkMode ? 'neutral.800' : 'neutral.50',
                        opacity: 1,          // ensure no alpha leakage
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'primary.900', // inherits the solid parent background
                            position: 'relative',
                            opacity: 1, // ensure no alpha leakage
                            zIndex: 10,
                        }}
                    >
                        <Typography
                            level="h4"
                            sx={{ color: darkMode ? 'primary.200' : 'text.primary' }}
                        >
                            Order Details
                        </Typography>
                        <IconButton
                            onClick={onClose}
                            variant="plain"
                            color="neutral"
                            sx={{ borderRadius: '50%' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>


                <CardContent>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : order ? (
                        <>
                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography level="h5" sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>Order #{order.id}</Typography>
                                    <Chip
                                        size="md"
                                        variant="soft"
                                        color={
                                            order.status === 'delivered' ? 'success' :
                                                order.status === 'shipped' ? 'primary' :
                                                    order.status === 'processing' ? 'info' :
                                                        order.status === 'cancelled' ? 'danger' : 'warning'
                                        }
                                    >
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Chip>
                                </Box>
                                <Typography level="body-sm" sx={{ color: darkMode ? 'neutral.400' : 'neutral.600' }}>
                                    Placed on {new Date(order.created_at).toLocaleString()}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Shipping Information */}
                            <Box sx={{ mb: 3 }}>
                                <Typography level="title-md" sx={{ mb: 1, color: darkMode ? 'primary.200' : 'background.paper' }}>Shipping Address</Typography>
                                {order.shipping_address ? (
                                    <Card variant="soft" size="sm" sx={{ p: 2 }}>
                                        <Typography>{order.shipping_address.fullName}</Typography>
                                        <Typography>{order.shipping_address.address}</Typography>
                                        <Typography>
                                            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
                                        </Typography>
                                        <Typography>{order.shipping_address.country}</Typography>
                                        <Typography>Phone: {order.shipping_address.phone}</Typography>
                                    </Card>
                                ) : (
                                    <Typography level="body-sm" sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>Shipping information not available</Typography>
                                )}
                            </Box>

                            {/* Payment Method */}
                            <Box sx={{ mb: 3 }}>
                                <Typography level="title-md" sx={{ mb: 1, color: darkMode ? 'primary.200' : 'background.paper' }}>Payment Method</Typography>
                                <Typography sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>
                                    {order.payment_method === 'credit_card' ? 'Credit Card' : 'Cash on Delivery'}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Order Items */}
                            <Box sx={{ mb: 3 }}>
                                <Typography level="title-md" sx={{ mb: 2, color: darkMode ? 'primary.200' : 'background.paper' }}>Order Items</Typography>

                                {order.items && order.items.length > 0 ? (
                                    <Box>
                                        {order.items.map((item) => (
                                            <Box
                                                key={item.id}
                                                sx={{
                                                    display: 'flex',
                                                    mb: 2,
                                                    p: 1.5,
                                                    borderRadius: 'md',
                                                    bgcolor: darkMode ? 'neutral.800' : 'neutral.100',
                                                }}
                                            >
                                                <AspectRatio
                                                    ratio="1"
                                                    sx={{
                                                        width: 60,
                                                        borderRadius: 'md',
                                                        overflow: 'hidden',
                                                        flexShrink: 0
                                                    }}
                                                >                                                    {(Array.isArray(item.images) && item.images.length > 0) ||
                                                    item.image_url || item.image ||
                                                    (item.product && ((Array.isArray(item.product.images) && item.product.images.length > 0) ||
                                                        item.product.image_url || item.product.image)) ? (
                                                    <img
                                                        src={formatImageUrl(
                                                            // First check images array
                                                            Array.isArray(item.images) && item.images.length > 0
                                                                ? item.images[0]
                                                                // Then check direct image URLs
                                                                : item.image_url || item.image
                                                                // Check if there's a nested product object with images
                                                                || (item.product && Array.isArray(item.product.images) && item.product.images.length > 0
                                                                    ? item.product.images[0]
                                                                    // Finally check for image URL on nested product
                                                                    : item.product?.image_url || item.product?.image || '')
                                                        )}
                                                        alt={item.name || (item.product?.name || 'Product')}
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: darkMode ? 'neutral.700' : 'neutral.200',
                                                        height: '100%'
                                                    }}>
                                                        No image
                                                    </Box>
                                                )}
                                                </AspectRatio>

                                                <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                        <Typography level="title-sm" sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>{item.name}</Typography>
                                                        <Typography level="body-md" fontWeight="bold" sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>${(item.price * item.quantity).toFixed(2)}</Typography>
                                                    </Box>
                                                    <Typography level="body-sm" sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>
                                                        Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography level="body-sm" sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>
                                        No items found for this order
                                    </Typography>
                                )}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            {/* Order Summary */}
                            <Box sx={{ mb: 2 }}>
                                <Typography level="title-md" sx={{ mb: 2, color: darkMode ? 'primary.200' : 'background.paper' }}>Order Summary</Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: darkMode ? 'primary.200' : 'background.paper' }}>
                                    <Typography sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>Subtotal:</Typography>
                                    <Typography sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>${(order.total_amount * 0.8).toFixed(2)}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: darkMode ? 'primary.200' : 'background.paper' }}>
                                    <Typography sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>Shipping:</Typography>
                                    <Typography sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>$50.00</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: darkMode ? 'primary.200' : 'background.paper' }}>
                                    <Typography sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>Tax (14%):</Typography>
                                    <Typography sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>${(order.total_amount * 0.06).toFixed(2)}</Typography>
                                </Box>

                                <Divider sx={{ my: 1.5 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography level="title-md" sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>Total:</Typography>
                                    <Typography level="title-md" sx={{ color: darkMode ? 'primary.200' : 'background.paper' }}>${Number(order.total_amount).toFixed(2)}</Typography>
                                </Box>
                            </Box>
                        </>
                    ) : (
                        <Typography level="body-md" sx={{ textAlign: 'center', py: 4, color: darkMode ? 'primary.200' : 'background.paper' }}>
                            Order information not available
                        </Typography>
                    )}
                </CardContent>

                <CardOverflow sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2, margin: 2 }}>
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={onClose}
                        fullWidth
                    >
                        Close
                    </Button>
                </CardOverflow>
            </Card>
        </Modal>
    );
}

export default Profile;
