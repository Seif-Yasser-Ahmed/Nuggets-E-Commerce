// src/components/ProductImageCarousel.js
import React, { useState, useEffect } from 'react';
import {
    Box,
    IconButton,
    Typography,
    ButtonGroup,
    AspectRatio,
    Sheet
} from '@mui/joy';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    ZoomIn as ZoomInIcon
} from '@mui/icons-material';
import { formatImageUrl } from '../utils/imageUtils';

/**
 * ProductImageCarousel component for displaying product images with zoom functionality
 * @param {Object} props Component props
 * @param {Array} props.images Array of image URLs
 * @param {Number} props.selectedImage Currently selected image index
 * @param {Function} props.setSelectedImage Function to set selected image index
 * @param {Boolean} props.isFavorite Whether the product is in the user's wishlist
 * @param {Function} props.toggleFavorite Function to toggle favorite status
 */
const ProductImageCarousel = ({
    images = [],
    selectedImage = 0,
    setSelectedImage,
    isFavorite = false,
    toggleFavorite
}) => {
    // State for zoom functionality
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [processedImages, setProcessedImages] = useState([]);    // Convert string or object to array for single image case
    const imageArray = Array.isArray(images)
        ? images
        : (images ? [images] : []);

    // Debug log to see what images are being received
    console.log("ProductImageCarousel received images:", images);
    console.log("Processed into imageArray:", imageArray);

    // Process images when the component mounts or images change
    useEffect(() => {
        // Process and format the image URLs
        const formatted = imageArray.map(img => {
            if (!img) return '';
            return formatImageUrl(img);
        }).filter(url => url); // Filter out empty URLs

        // If we still have no valid images after processing, add a placeholder
        const finalImages = formatted.length > 0 ? formatted : [''];
        console.log("Final processed images:", finalImages);
        setProcessedImages(finalImages);
    }, [images]);

    // Navigation handlers
    const goNext = () => {
        setSelectedImage((prev) => (prev + 1) % imageArray.length);
        setIsZoomed(false); // Reset zoom when changing image
    };

    const goPrev = () => {
        setSelectedImage((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
        setIsZoomed(false); // Reset zoom when changing image
    };

    // Handle mouse movement for zoom effect
    const handleMouseMove = (e) => {
        if (!isZoomed) return;

        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;

        setZoomPosition({ x, y });
    };

    // Get the current image URL, making sure it's valid
    const currentImageUrl = processedImages.length > 0 ? processedImages[selectedImage] || '' : '';
    console.log("Current image URL:", currentImageUrl);

    return (
        <Box sx={{ position: 'relative', mb: 2 }}>
            {/* Main image with zoom container */}
            <AspectRatio
                ratio="1/1"
                sx={{
                    borderRadius: 'md',
                    overflow: 'hidden',
                    cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                    position: 'relative',
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
                onClick={() => setIsZoomed(!isZoomed)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => isZoomed && setIsZoomed(false)}
            >
                {currentImageUrl ? (
                    <Box
                        component="img"
                        src={currentImageUrl}
                        alt={`Product image ${selectedImage + 1}`}
                        sx={{
                            objectFit: 'contain',
                            width: '100%',
                            height: '100%',
                            transition: 'transform 0.2s ease-out',
                            transform: isZoomed ? 'scale(2.5)' : 'scale(1)',
                            transformOrigin: isZoomed
                                ? `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`
                                : 'center center',
                        }}
                        onError={(e) => {
                            console.error("Image loading error:", e.target.src);
                            // Handle image loading errors by using a placeholder
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlMGUwZTAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzc1NzU3NSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            bgcolor: 'neutral.100',
                            color: 'neutral.600',
                        }}
                    >
                        <Typography level="body-sm">No image available</Typography>
                    </Box>
                )}

                {/* Zoom indicator */}
                {!isZoomed && currentImageUrl && (
                    <Box
                        sx={{
                            position: 'absolute',
                            right: 8,
                            bottom: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '50%',
                            p: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                            boxShadow: 'sm',
                            zIndex: 2,
                        }}
                    >
                        <ZoomInIcon fontSize="small" />
                    </Box>
                )}
            </AspectRatio>

            {/* Previous/Next image navigation buttons - only shown if multiple images */}
            {imageArray.length > 1 && (
                <>
                    <IconButton
                        size="lg"
                        variant="soft"
                        color="neutral"
                        onClick={goPrev}
                        sx={{
                            position: 'absolute',
                            left: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                        }}
                    >
                        <ChevronLeftIcon />
                    </IconButton>
                    <IconButton
                        size="lg"
                        variant="soft"
                        color="neutral"
                        onClick={goNext}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 2,
                            bgcolor: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                        }}
                    >
                        <ChevronRightIcon />
                    </IconButton>
                </>
            )}

            {/* Wishlist button */}
            <IconButton
                size="md"
                variant="soft"
                color={isFavorite ? 'danger' : 'neutral'}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite();
                }}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    zIndex: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                }}
            >
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>

            {/* Image counter indicator */}
            {imageArray.length > 1 && (
                <Box
                    sx={{
                        position: 'absolute',
                        left: 8,
                        bottom: 'calc(20% + 16px)', // Position it above the thumbnails
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 'md',
                        fontSize: '0.75rem',
                        zIndex: 2,
                    }}
                >
                    {selectedImage + 1} / {imageArray.length}
                </Box>
            )}

            {/* Thumbnails row - only shown if multiple images */}
            {imageArray.length > 1 && processedImages.length > 0 && (
                <Box sx={{ display: 'flex', gap: 2, mt: 1, overflowX: 'auto', pb: 1 }}>
                    {processedImages.map((image, index) => (
                        <Sheet
                            key={index}
                            variant={selectedImage === index ? 'outlined' : 'plain'}
                            onClick={() => {
                                setSelectedImage(index);
                                setIsZoomed(false); // Reset zoom when changing image
                            }}
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 'md',
                                cursor: 'pointer',
                                opacity: selectedImage === index ? 1 : 0.6,
                                transition: 'all 0.2s ease',
                                outline: selectedImage === index ? '2px solid' : 'none',
                                outlineColor: 'primary.500',
                                '&:hover': { opacity: 1 },
                                flexShrink: 0,
                                overflow: 'hidden',
                            }}
                        >
                            {image ? (
                                <Box
                                    component="img"
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        bgcolor: 'neutral.100',
                                        color: 'neutral.600',
                                    }}
                                >
                                    <Typography level="body-sm" fontSize="xs">No image</Typography>
                                </Box>
                            )}
                        </Sheet>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default ProductImageCarousel;