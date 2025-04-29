// src/pages/Store.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Input,
    IconButton,
    FormControl,
    FormLabel,
    Slider,
    Checkbox,
    List,
    ListItem,
    CircularProgress,
    Divider,
    Sheet,
    Alert,
    Button,
    Select,
    Option,
    Chip
} from '@mui/joy';
import {
    Search as SearchIcon,
    FilterList as FilterListIcon,
    Close as CloseIcon,
    SortByAlpha as SortIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { getProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';

const Store = () => {
    const { darkMode } = useTheme();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [sortBy, setSortBy] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);

    // Fetch products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Apply filters whenever filter criteria change
    useEffect(() => {
        applyFilters();
    }, [products, searchTerm, priceRange, selectedCategories, sortBy]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getProducts();

            if (response.data && response.data.data) {
                const productData = response.data.data;
                setProducts(productData);

                // Extract unique categories
                const allCategories = [...new Set(productData.map(product => product.category))];
                setCategories(allCategories);

                // Find minimum and maximum prices for range slider
                const prices = productData.map(product => product.price).filter(price => price !== undefined);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                setMaxPrice(maxPrice);
                setPriceRange([minPrice, maxPrice]);

                // Apply initial filters
                setFilteredProducts(productData);
            } else {
                setError('Failed to load products. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!products.length) return;

        // First filter by search term
        let filtered = products;

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchLower) ||
                product.description.toLowerCase().includes(searchLower) ||
                product.category.toLowerCase().includes(searchLower)
            );
        }

        // Then filter by price range
        filtered = filtered.filter(product =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );

        // Then filter by selected categories
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(product =>
                selectedCategories.includes(product.category)
            );
        }

        // Sort the filtered products
        switch (sortBy) {
            case 'priceAsc':
                filtered.sort((a, b) => a.price - b.price);
                break;
            case 'priceDesc':
                filtered.sort((a, b) => b.price - a.price);
                break;
            case 'nameAsc':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'nameDesc':
                filtered.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
                // If products have created_at field
                filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                break;
            default: // 'featured'
                // Using a hybrid sort (discounted items first, then by price descending)
                filtered.sort((a, b) => {
                    if ((a.discount || 0) > 0 && (b.discount || 0) === 0) return -1;
                    if ((a.discount || 0) === 0 && (b.discount || 0) > 0) return 1;
                    return b.price - a.price;
                });
        }

        setFilteredProducts(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handlePriceChange = (event, newValue) => {
        setPriceRange(newValue);
    };

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(cat => cat !== category);
            } else {
                return [...prev, category];
            }
        });
    };

    const handleSortChange = (e, value) => {
        if (value !== null) {
            setSortBy(value);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setPriceRange([0, maxPrice]);
        setSelectedCategories([]);
        setSortBy('featured');
    };

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'start', sm: 'center' },
                mb: 4
            }}>
                <Typography level="h3" sx={{ mb: { xs: 2, sm: 0 }, color: darkMode ? 'primary.300' : 'neutral.800' }}>
                    Browse Products
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <FormControl sx={{ width: { xs: '100%', sm: 200 } }}>
                        <Input
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            startDecorator={<SearchIcon />}
                            endDecorator={
                                searchTerm && (
                                    <IconButton variant="plain" onClick={() => setSearchTerm('')}>
                                        <CloseIcon />
                                    </IconButton>
                                )
                            }
                        />
                    </FormControl>

                    <IconButton
                        variant={showFilters ? 'solid' : 'outlined'}
                        color={showFilters ? 'primary' : 'neutral'}
                        onClick={toggleFilters}
                        sx={{ display: { xs: 'flex', md: 'none' } }}
                    >
                        <FilterListIcon />
                    </IconButton>
                </Box>
            </Box>

            <Grid container spacing={4}>
                {/* Filters - Desktop */}
                <Grid xs={12} md={3} sx={{ display: { xs: showFilters ? 'block' : 'none', md: 'block' } }}>
                    <Sheet
                        variant="outlined"
                        sx={{
                            p: 2,
                            borderRadius: 'md',
                            mb: { xs: 2, md: 0 }
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2
                        }}>
                            <Typography level="title-lg">Filters</Typography>
                            <Button
                                size="sm"
                                variant="plain"
                                color="neutral"
                                onClick={clearFilters}
                            >
                                Clear All
                            </Button>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Price Range */}
                        <FormControl sx={{ mb: 3 }}>
                            <FormLabel>Price Range</FormLabel>
                            <Slider
                                value={priceRange}
                                onChange={handlePriceChange}
                                valueLabelDisplay="auto"
                                min={0}
                                max={maxPrice}
                                disableSwap
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography level="body-sm">{priceRange[0]} EGP</Typography>
                                <Typography level="body-sm">{priceRange[1]} EGP</Typography>
                            </Box>
                        </FormControl>

                        <Divider sx={{ my: 2 }} />

                        {/* Categories */}
                        <FormControl>
                            <FormLabel>Categories</FormLabel>
                            <List size="sm">
                                {categories.map((category) => (
                                    <ListItem key={category}>
                                        <Checkbox
                                            label={category}
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => handleCategoryToggle(category)}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </FormControl>

                        {/* Mobile only - Close button */}
                        <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 3 }}>
                            <Button
                                fullWidth
                                onClick={toggleFilters}
                                variant="soft"
                            >
                                Apply Filters
                            </Button>
                        </Box>
                    </Sheet>
                </Grid>

                {/* Products List */}
                <Grid xs={12} md={9}>
                    {/* Sorting and Results count */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        flexWrap: 'wrap',
                        gap: 1
                    }}>
                        <Box>
                            <Typography level="body-sm">
                                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {selectedCategories.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {selectedCategories.map(cat => (
                                        <Chip
                                            key={cat}
                                            size="sm"
                                            variant="soft"
                                            color="primary"
                                            endDecorator={<CloseIcon fontSize="small" />}
                                            onClick={() => handleCategoryToggle(cat)}
                                        >
                                            {cat}
                                        </Chip>
                                    ))}
                                </Box>
                            )}

                            <FormControl size="sm">
                                <Select
                                    startDecorator={<SortIcon />}
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    size="sm"
                                >
                                    <Option value="featured">Featured</Option>
                                    <Option value="priceAsc">Price: Low to High</Option>
                                    <Option value="priceDesc">Price: High to Low</Option>
                                    <Option value="nameAsc">Name: A to Z</Option>
                                    <Option value="nameDesc">Name: Z to A</Option>
                                    <Option value="newest">Newest First</Option>
                                </Select>
                            </FormControl>
                        </Box>
                    </Box>

                    {/* Loading, Error, or Products */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert color="danger" sx={{ my: 2 }}>
                            {error}
                        </Alert>
                    ) : filteredProducts.length > 0 ? (
                        <Grid container spacing={2}>
                            {filteredProducts.map((product) => (
                                <Grid key={product.id} xs={12} sm={6} md={4}>
                                    <ProductCard product={{
                                        id: product.id,
                                        name: product.name,
                                        category: product.category,
                                        price: product.price,
                                        currency: 'EGP',
                                        image: product.image_url,
                                        rating: product.rating || 4,
                                        stock: product.stock || 10,
                                        discount: product.discount || 0,
                                        isNewArrival: new Date(product.created_at || Date.now()) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                    }} />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{
                            py: 8,
                            textAlign: 'center',
                            bgcolor: 'background.surface',
                            borderRadius: 'md',
                            border: '1px dashed',
                            borderColor: 'neutral.300'
                        }}>
                            <Typography level="h5" sx={{ mb: 1 }}>
                                No products found
                            </Typography>
                            <Typography level="body-sm" sx={{ mb: 3, color: 'neutral.500' }}>
                                Try adjusting your search or filter criteria
                            </Typography>
                            <Button
                                onClick={clearFilters}
                                variant="outlined"
                                color="neutral"
                            >
                                Clear All Filters
                            </Button>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default Store;