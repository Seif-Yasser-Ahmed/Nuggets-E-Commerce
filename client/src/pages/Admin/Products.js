import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Grid,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    Snackbar,
    InputAdornment,
    Switch,
    FormControlLabel,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    InventoryRounded,
    FormatColorFill as ColorIcon,
    Straighten as SizeIcon,
    CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import API, { formatId } from '../../services/api';
import { formatImageUrl } from '../../utils/imageUtils';

const Products = () => {
    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image_url: '',
        images: [],
        stock: '',
        discount: '0',
        specs: {},
        hasColors: false,
        hasSizes: false,
    });

    // Specs, Colors, and Sizes state (for dynamic form fields)
    const [specs, setSpecs] = useState([{ key: '', value: '' }]);
    const [colors, setColors] = useState([{ name: '', value: '' }]);
    const [sizes, setSizes] = useState(['']);

    // Image upload state
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const multipleFileInputRef = useRef(null);

    // Load products and categories
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await API.get('/products');
            setProducts(response.data.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await API.get('/products/categories');
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'price' || name === 'stock' || name === 'discount'
                ? value === '' ? '' : Number(value)
                : value
        });
    };

    // Handle toggle changes
    const handleToggleChange = (e) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked
        });
    };

    // Check if a field is required
    const isFieldRequired = (fieldName) => {
        const requiredFields = ['name', 'description', 'price', 'category', 'stock'];
        return requiredFields.includes(fieldName);
    };

    // Handle spec changes
    const handleSpecChange = (index, field, value) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = value;
        setSpecs(newSpecs);
    };

    const addSpecField = () => {
        setSpecs([...specs, { key: '', value: '' }]);
    };

    const removeSpecField = (index) => {
        const newSpecs = specs.filter((_, i) => i !== index);
        setSpecs(newSpecs);
    };

    // Handle color changes
    const handleColorChange = (index, field, value) => {
        const newColors = [...colors];
        newColors[index][field] = value;
        setColors(newColors);
    };

    const addColorField = () => {
        setColors([...colors, { name: '', value: '' }]);
    };

    const removeColorField = (index) => {
        const newColors = colors.filter((_, i) => i !== index);
        setColors(newColors);
    };

    // Handle size changes
    const handleSizeChange = (index, value) => {
        const newSizes = [...sizes];
        newSizes[index] = value;
        setSizes(newSizes);
    };

    const addSizeField = () => {
        setSizes([...sizes, '']);
    };

    const removeSizeField = (index) => {
        const newSizes = sizes.filter((_, i) => i !== index);
        setSizes(newSizes);
    };

    // Open dialog for adding a new product
    const handleAddProduct = () => {
        setIsEditing(false);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            image_url: '',
            images: [],
            stock: '',
            discount: '0',
            specs: {},
            hasColors: false,
            hasSizes: false,
        });
        setSpecs([{ key: '', value: '' }]);
        setColors([{ name: '', value: '' }]);
        setSizes(['']);
        setImageFiles([]);
        setImagePreviews([]);
        setDialogOpen(true);
    };

    // Open dialog for editing an existing product
    const handleEditProduct = (product) => {
        setIsEditing(true);
        setCurrentProduct(product);

        // Convert specs object to array for form
        const specsArray = product.specs && Object.keys(product.specs).length
            ? Object.entries(product.specs).map(([key, value]) => ({ key, value }))
            : [{ key: '', value: '' }];

        // Setup colors array
        const hasColors = Array.isArray(product.colors) && product.colors.length > 0;
        const colorsArray = hasColors
            ? product.colors
            : [{ name: '', value: '' }];

        // Setup sizes array
        const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
        const sizesArray = hasSizes
            ? product.sizes
            : [''];

        setSpecs(specsArray);
        setColors(colorsArray);
        setSizes(sizesArray);

        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            image_url: product.image_url,
            images: product.images || [],
            stock: product.stock,
            discount: product.discount || 0,
            specs: product.specs || {},
            hasColors: hasColors,
            hasSizes: hasSizes,
        });

        setImageFiles([]);
        setImagePreviews(product.images || []);

        setDialogOpen(true);
    };

    // Delete a product
    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        // Check if we have a valid ID
        if (!id) {
            console.error('Attempted to delete product with undefined ID');
            setSnackbar({
                open: true,
                message: 'Failed to delete product: Invalid product ID',
                severity: 'error'
            });
            return;
        }

        try {
            // Format the ID properly for MongoDB
            const formattedId = formatId(id);

            if (!formattedId) {
                setSnackbar({
                    open: true,
                    message: 'Failed to delete product: Could not format the product ID',
                    severity: 'error'
                });
                return;
            }            // Make the API request with the formatted ID
            await API.delete(`/products/${formattedId}`);

            // Instead of just filtering the current list, fetch fresh data
            // This ensures our view is in sync with the database
            await fetchProducts();

            setSnackbar({
                open: true,
                message: 'Product deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            setSnackbar({
                open: true,
                message: 'Failed to delete product',
                severity: 'error'
            });
        }
    };// Handle multiple image selection
    const handleMultipleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // Preview the images
            const newImageURLs = files.map(file => URL.createObjectURL(file));
            setImagePreviews([...imagePreviews, ...newImageURLs]);

            // Update the image files array
            setImageFiles([...imageFiles, ...files]);

            // Set the first image as the main image for form data if no main image is already set
            if (files.length > 0 && imageFiles.length === 0 && imagePreviews.length === 0) {
                // Just set a reference to the first file - the actual URL will be created by the server
                setFormData(prev => ({
                    ...prev,
                    image_url: files[0].name // Just use the name as a reference
                }));
            }

            console.log(`Added ${files.length} image(s) to form data`);
        }
    };

    // Remove an image from the preview/selection
    const handleRemoveImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Submit form to create or update a product
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Enhanced validation for required fields
        const requiredFields = [
            { name: 'name', value: formData.name },
            { name: 'price', value: formData.price },
            { name: 'description', value: formData.description },
            { name: 'category', value: formData.category }
        ];

        const missingFields = requiredFields.filter(field => !field.value);

        if (missingFields.length > 0) {
            setSnackbar({
                open: true,
                message: `Please fill in all required fields: ${missingFields.map(f => f.name).join(', ')}`,
                severity: 'error'
            });
            return;
        }        // Check if at least one image is uploaded
        if (imageFiles.length === 0 && !formData.image_url && imagePreviews.length === 0) {
            setSnackbar({
                open: true,
                message: 'Please upload at least one product image',
                severity: 'error'
            });
            return;
        }        // Create form data for submission
        const productFormData = new FormData();

        // Process product specifications
        if (specs.length > 0) {
            const specsObject = {};
            specs.forEach(spec => {
                if (spec.key && spec.value) {
                    specsObject[spec.key] = spec.value;
                }
            });
            if (Object.keys(specsObject).length > 0) {
                productFormData.append('specs', JSON.stringify(specsObject));
            }
        }

        // Process colors and sizes
        if (formData.hasColors && colors.length > 0) {
            const validColors = colors.filter(color => color.name && color.value);
            if (validColors.length > 0) {
                productFormData.append('colors', JSON.stringify(validColors));
            }
        }

        if (formData.hasSizes && sizes.length > 0) {
            const validSizes = sizes.filter(size => size.trim() !== '');
            if (validSizes.length > 0) {
                productFormData.append('sizes', JSON.stringify(validSizes));
            }
        }

        // Add basic form fields - ensure proper type conversion
        productFormData.append('name', formData.name.trim());
        productFormData.append('description', formData.description.trim());

        // Make sure price is a number
        const price = parseFloat(formData.price);
        // if (!isNaN(price)) {
        //     productFormData.append('price', price);
        // } else {
        //     setSnackbar({
        //         open: true,
        //         message: 'Invalid price format',
        //         severity: 'error'
        //     });
        //     return;
        // }
        productFormData.append('price', price);

        productFormData.append('category', formData.category.trim());

        // Make sure stock is a number
        const stock = parseInt(formData.stock);
        if (!isNaN(stock)) {
            productFormData.append('stock', stock);
        } else {
            productFormData.append('stock', 0); // Default to 0 if invalid
        }

        // Make sure discount is a number
        const discount = parseInt(formData.discount) || 0;
        productFormData.append('discount', discount);

        // Add images to form data
        if (imageFiles.length > 0) {
            // Use the first image as the main image if available
            imageFiles.forEach((file, index) => {
                productFormData.append('images', file);
            });
            console.log(`Added ${imageFiles.length} new image files to form data`);
        }

        // If editing and there are existing images but no new ones, we need to preserve them
        if (isEditing && imageFiles.length === 0 && imagePreviews.length > 0) {
            // Make sure we're passing valid image paths
            let existingImages = Array.isArray(currentProduct.images) && currentProduct.images.length > 0
                ? currentProduct.images
                : (currentProduct.image_url ? [currentProduct.image_url] : []);

            // Filter out any null or undefined values
            existingImages = existingImages.filter(img => img);

            if (existingImages.length > 0) {
                productFormData.append('existingImages', JSON.stringify(existingImages));
                console.log(`Preserving ${existingImages.length} existing images:`, existingImages);
            } else {
                console.warn('No valid existing images found to preserve');
            }
        } try {
            setLoading(true);

            // Log what we're about to send for debugging purposes
            console.log(`${isEditing ? 'Updating' : 'Creating'} product with form data`);

            // Check form data content
            for (let [key, value] of productFormData.entries()) {
                console.log(`Form data: ${key} = ${typeof value === 'object' ? 'File/Object' : value}`);
            }

            if (isEditing && currentProduct) {
                // Make sure we have a valid ID for the update
                const productId = currentProduct.id || currentProduct._id;
                if (!productId) {
                    throw new Error('Missing product ID for update');
                }

                const formattedId = formatId(productId);
                if (!formattedId) {
                    throw new Error('Could not format product ID for update');
                }

                // Update existing product
                await API.put(`/products/${formattedId}`, productFormData);
                setSnackbar({
                    open: true,
                    message: 'Product updated successfully',
                    severity: 'success'
                });
            } else {
                // Create new product
                await API.post('/products', productFormData);
                setSnackbar({
                    open: true,
                    message: 'Product added successfully',
                    severity: 'success'
                });
            }

            // Refresh product list
            fetchProducts();
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving product:', error);

            let errorMessage = 'Failed to save product';

            // Try to extract detailed error message from the response
            if (error.response) {
                console.log('Error response:', error.response);

                if (error.response.data?.error) {
                    errorMessage = `${errorMessage}: ${error.response.data.error}`;
                } else if (error.response.data?.details?.length > 0) {
                    errorMessage = `${errorMessage}: ${error.response.data.details.join(', ')}`;
                } else if (error.response.data?.message) {
                    errorMessage = `${errorMessage}: ${error.response.data.message}`;
                } else if (error.response.statusText) {
                    errorMessage = `${errorMessage}: ${error.response.statusText} (${error.response.status})`;
                }
            } else if (error.message) {
                errorMessage = `${errorMessage}: ${error.message}`;
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Add new category
    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;

        // Add the new category to the categories list
        const updatedCategories = [...categories, newCategoryName.trim()];
        setCategories(updatedCategories);

        // Update the form to use the new category
        setFormData({
            ...formData,
            category: newCategoryName.trim()
        });

        // Close the dialog and reset the input
        setNewCategoryDialogOpen(false);
        setNewCategoryName('');

        // Show success message
        setSnackbar({
            open: true,
            message: 'Category added successfully',
            severity: 'success'
        });
    };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Product Management</Typography>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Search and Add Button */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}
            >
                <TextField
                    placeholder="Search products..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: '300px' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddProduct}
                >
                    Add Product
                </Button>
            </Box>

            {/* Products Table */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Image</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Stock</TableCell>
                                <TableCell>Discount</TableCell>
                                <TableCell>Variants</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            {product.image_url ? (
                                                <Box
                                                    component="img"
                                                    src={formatImageUrl(product.image_url)}
                                                    alt={product.name}
                                                    sx={{
                                                        width: 50,
                                                        height: 50,
                                                        objectFit: 'cover',
                                                        borderRadius: 1
                                                    }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        width: 50,
                                                        height: 50,
                                                        bgcolor: 'grey.300',
                                                        borderRadius: 1,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <InventoryRounded color="disabled" />
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={product.category}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>${product.price.toFixed(2)}</TableCell>
                                        <TableCell>
                                            {product.stock < 10 ? (
                                                <Chip
                                                    label={`${product.stock} units`}
                                                    size="small"
                                                    color="error"
                                                />
                                            ) : (
                                                product.stock
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {product.discount > 0 ? (
                                                <Chip
                                                    label={`${product.discount}%`}
                                                    size="small"
                                                    color="secondary"
                                                />
                                            ) : 'None'}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                {Array.isArray(product.colors) && product.colors.length > 0 && (
                                                    <Chip
                                                        icon={<ColorIcon />}
                                                        label={`${product.colors.length} colors`}
                                                        size="small"
                                                        color="info"
                                                    />
                                                )}
                                                {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                                                    <Chip
                                                        icon={<SizeIcon />}
                                                        label={`${product.sizes.length} sizes`}
                                                        size="small"
                                                        color="success"
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                color="primary"
                                                onClick={() => handleEditProduct(product)}
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteProduct(product._id || product.id)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        No products found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add/Edit Product Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {isEditing ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    name="name"
                                    label="Product Name *"
                                    fullWidth
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    variant="outlined"
                                    error={!formData.name && formData.name !== undefined}
                                    helperText={!formData.name && formData.name !== undefined ? "Product name is required" : ""}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required error={!formData.category}>
                                    <InputLabel>Category *</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={(e) => {
                                            if (e.target.value === "new") {
                                                setNewCategoryDialogOpen(true);
                                            } else {
                                                handleChange(e);
                                            }
                                        }}
                                        label="Category *"
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                        <MenuItem value="new">
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <AddIcon sx={{ mr: 1 }} fontSize="small" />
                                                Add New Category
                                            </Box>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {formData.category === 'new' && (
                                <Grid item xs={12}>
                                    <TextField
                                        name="newCategory"
                                        label="New Category Name"
                                        fullWidth
                                        required
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                category: e.target.value
                                            });
                                        }}
                                        variant="outlined"
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} md={4}>
                                <TextField
                                    name="price"
                                    label="Price *"
                                    type="number"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                    fullWidth
                                    required
                                    value={formData.price}
                                    onChange={handleChange}
                                    variant="outlined"
                                    error={!formData.price && formData.price !== undefined}
                                    helperText={!formData.price && formData.price !== undefined ? "Price is required" : ""}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    name="stock"
                                    label="Stock *"
                                    type="number"
                                    fullWidth
                                    required
                                    value={formData.stock}
                                    onChange={handleChange}
                                    variant="outlined"
                                    error={!formData.stock && formData.stock !== undefined}
                                    helperText={!formData.stock && formData.stock !== undefined ? "Stock is required" : ""}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    name="discount"
                                    label="Discount (%)"
                                    type="number"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                    fullWidth
                                    value={formData.discount}
                                    onChange={handleChange}
                                    variant="outlined"
                                    inputProps={{ min: 0, max: 100 }}
                                />
                            </Grid>                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                    Product Images*
                                </Typography>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="multiple-image-upload"
                                    type="file"
                                    multiple
                                    onChange={handleMultipleImageChange}
                                    ref={multipleFileInputRef}
                                />
                                <label htmlFor="multiple-image-upload">
                                    <Button
                                        variant="contained"
                                        component="span"
                                        startIcon={<CloudUploadIcon />}
                                        fullWidth
                                        color="primary"
                                    >
                                        Upload Product Images
                                    </Button>
                                </label>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                                    You can select multiple images at once. The first image will be used as the main product image.
                                </Typography>

                                {imagePreviews.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                            {imagePreviews.length === 1 ? '1 image selected' : `${imagePreviews.length} images selected`}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                            {imagePreviews.map((preview, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        position: 'relative',
                                                        width: 100,
                                                        height: 100,
                                                        borderRadius: 1,
                                                        overflow: 'hidden',
                                                        bgcolor: 'grey.300',
                                                        border: index === 0 ? '2px solid #4caf50' : 'none',
                                                    }}
                                                >
                                                    {index === 0 && (
                                                        <Chip
                                                            label="Main"
                                                            size="small"
                                                            color="success"
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 4,
                                                                left: 4,
                                                                zIndex: 2,
                                                                fontSize: '0.7rem',
                                                                height: '20px'
                                                            }}
                                                        />
                                                    )}
                                                    <Box
                                                        component="img"
                                                        src={preview}
                                                        alt={`Image preview ${index + 1}`}
                                                        sx={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 4,
                                                            right: 4,
                                                            bgcolor: 'rgba(255,255,255,0.8)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(255,0,0,0.1)'
                                                            },
                                                            width: 24,
                                                            height: 24
                                                        }}
                                                        onClick={() => handleRemoveImage(index)}
                                                    >
                                                        <DeleteIcon fontSize="small" color="error" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    name="description"
                                    label="Description *"
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    variant="outlined"
                                    error={!formData.description && formData.description !== undefined}
                                    helperText={!formData.description && formData.description !== undefined ? "Description is required" : ""}
                                />
                            </Grid>

                            {/* Product Variants Section */}
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                    Product Variants
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name="hasColors"
                                                checked={formData.hasColors}
                                                onChange={handleToggleChange}
                                            />
                                        }
                                        label="This product has color variants"
                                    />

                                    {formData.hasColors && (
                                        <Box sx={{ ml: 4, mt: 1 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Colors
                                            </Typography>

                                            {colors.map((color, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 2,
                                                        gap: 2
                                                    }}
                                                >
                                                    <TextField
                                                        label="Color Name"
                                                        value={color.name}
                                                        onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                                                        sx={{ flex: 1 }}
                                                        placeholder="e.g., Black, Red, Blue"
                                                    />
                                                    <TextField
                                                        label="Color Value"
                                                        value={color.value}
                                                        onChange={(e) => handleColorChange(index, 'value', e.target.value)}
                                                        sx={{ flex: 1 }}
                                                        placeholder="e.g., #000000"
                                                    />
                                                    <Box
                                                        sx={{
                                                            width: 30,
                                                            height: 30,
                                                            bgcolor: color.value || '#CCCCCC',
                                                            borderRadius: '4px',
                                                            border: '1px solid #ddd'
                                                        }}
                                                    />
                                                    <IconButton
                                                        onClick={() => removeColorField(index)}
                                                        disabled={colors.length === 1}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            ))}

                                            <Button
                                                startIcon={<AddIcon />}
                                                onClick={addColorField}
                                                variant="outlined"
                                                size="small"
                                                sx={{ mt: 1 }}
                                            >
                                                Add Color
                                            </Button>
                                        </Box>
                                    )}

                                    <FormControlLabel
                                        control={
                                            <Switch
                                                name="hasSizes"
                                                checked={formData.hasSizes}
                                                onChange={handleToggleChange}
                                            />
                                        }
                                        label="This product has size variants"
                                    />

                                    {formData.hasSizes && (
                                        <Box sx={{ ml: 4, mt: 1 }}>
                                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                Sizes
                                            </Typography>

                                            {sizes.map((size, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        mb: 2,
                                                        gap: 2
                                                    }}
                                                >
                                                    <TextField
                                                        label="Size"
                                                        value={size}
                                                        onChange={(e) => handleSizeChange(index, e.target.value)}
                                                        sx={{ flex: 1 }}
                                                        placeholder="e.g., S, M, L, XL"
                                                    />
                                                    <IconButton
                                                        onClick={() => removeSizeField(index)}
                                                        disabled={sizes.length === 1}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            ))}

                                            <Button
                                                startIcon={<AddIcon />}
                                                onClick={addSizeField}
                                                variant="outlined"
                                                size="small"
                                                sx={{ mt: 1 }}
                                            >
                                                Add Size
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>

                            {/* Specifications */}
                            <Grid item xs={12}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                    Product Specifications
                                </Typography>

                                {specs.map((spec, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            mb: 2
                                        }}
                                    >
                                        <TextField
                                            label="Specification"
                                            value={spec.key}
                                            onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                                            sx={{ mr: 2, flex: 1 }}
                                        />
                                        <TextField
                                            label="Value"
                                            value={spec.value}
                                            onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                                            sx={{ flex: 1 }}
                                        />
                                        <IconButton
                                            onClick={() => removeSpecField(index)}
                                            disabled={specs.length === 1}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                ))}

                                <Button
                                    startIcon={<AddIcon />}
                                    onClick={addSpecField}
                                    variant="outlined"
                                    size="small"
                                >
                                    Add Specification
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        {isEditing ? 'Update Product' : 'Add Product'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* New Category Dialog */}
            <Dialog
                open={newCategoryDialogOpen}
                onClose={() => setNewCategoryDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Add New Category</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Category Name"
                            fullWidth
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            variant="outlined"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNewCategoryDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddCategory}
                        disabled={!newCategoryName.trim()}
                    >
                        Add Category
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Products;