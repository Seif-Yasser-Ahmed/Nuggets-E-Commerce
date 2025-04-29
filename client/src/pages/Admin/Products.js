import React, { useState, useEffect } from 'react';
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
    Straighten as SizeIcon
} from '@mui/icons-material';
import API from '../../services/api';

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
            stock: '',
            discount: '0',
            specs: {},
            hasColors: false,
            hasSizes: false,
        });
        setSpecs([{ key: '', value: '' }]);
        setColors([{ name: '', value: '' }]);
        setSizes(['']);
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
            stock: product.stock,
            discount: product.discount || 0,
            specs: product.specs || {},
            hasColors: hasColors,
            hasSizes: hasSizes,
        });

        setDialogOpen(true);
    };

    // Delete a product
    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await API.delete(`/products/${id}`);
            setProducts(products.filter(product => product.id !== id));
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
    };

    // Submit form to create or update a product
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert specs array to object
        const specsObject = {};
        specs.forEach(spec => {
            if (spec.key.trim() && spec.value.trim()) {
                specsObject[spec.key.trim()] = spec.value.trim();
            }
        });

        // Filter out empty colors and sizes
        const filteredColors = formData.hasColors
            ? colors.filter(color => color.name.trim() && color.value.trim())
            : [];

        const filteredSizes = formData.hasSizes
            ? sizes.filter(size => size.trim())
            : [];

        const productData = {
            ...formData,
            specs: specsObject,
            colors: filteredColors,
            sizes: filteredSizes
        };

        try {
            if (isEditing) {
                await API.put(`/products/${currentProduct.id}`, productData);
                setSnackbar({
                    open: true,
                    message: 'Product updated successfully',
                    severity: 'success'
                });
            } else {
                await API.post('/products', productData);
                setSnackbar({
                    open: true,
                    message: 'Product added successfully',
                    severity: 'success'
                });
            }

            // Refresh products
            fetchProducts();
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving product:', error);
            setSnackbar({
                open: true,
                message: 'Failed to save product',
                severity: 'error'
            });
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
                                                    src={product.image_url}
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
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteProduct(product.id)}
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
                                    label="Product Name"
                                    fullWidth
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Category</InputLabel>
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
                                        label="Category"
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
                                    label="Price"
                                    type="number"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                    }}
                                    fullWidth
                                    required
                                    value={formData.price}
                                    onChange={handleChange}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    name="stock"
                                    label="Stock"
                                    type="number"
                                    fullWidth
                                    required
                                    value={formData.stock}
                                    onChange={handleChange}
                                    variant="outlined"
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
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    name="image_url"
                                    label="Image URL"
                                    fullWidth
                                    value={formData.image_url || ''}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="https://example.com/image.jpg"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    name="description"
                                    label="Description"
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    variant="outlined"
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