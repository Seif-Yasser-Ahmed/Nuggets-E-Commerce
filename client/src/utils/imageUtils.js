/**
 * Formats the image URL to ensure it's complete and valid
 * @param {string} url - The image URL that needs to be formatted
 * @returns {string} - The properly formatted image URL
 */
export const formatImageUrl = (url) => {
    // console.log('formatImageUrl received:', url);

    // If the URL is null, undefined or not a string, return placeholder
    if (!url || typeof url !== 'string') {
        // console.log('Invalid URL, returning placeholder');
        return getPlaceholderImage();
    }

    // If the URL is already a complete URL or a data URL, return it
    if (url.startsWith('http') || url.startsWith('data:')) {
        // console.log('URL is already complete:', url);
        return url;
    }

    // Server base URL
    const serverBaseUrl = 'http://localhost:5000';

    // If we have an array as a string, try to extract the first URL
    if (url.startsWith('[') && url.includes(']')) {
        try {
            const parsed = JSON.parse(url);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // console.log('Extracted URL from array string:', parsed[0]);
                // Recursively format the extracted URL
                return formatImageUrl(parsed[0]);
            }
        } catch (e) {
            console.log('Failed to parse array-like string:', e);
            // Continue with normal processing if parsing fails
        }
    }

    // Remove any leading or trailing quotes if present
    const cleanUrl = url.replace(/^["']|["']$/g, '');

    // If the URL is a relative path from server root (starting with '/')
    if (cleanUrl.startsWith('/')) {
        // Make sure we don't add double slashes
        const formattedUrl = `${serverBaseUrl}${cleanUrl}`;
        // console.log('URL had leading slash, formatted as:', formattedUrl);
        return formattedUrl;
    }

    // For product images that include 'product_' prefix
    if (cleanUrl.includes('product_')) {
        // Check if path already includes 'uploads/products/'
        if (cleanUrl.includes('uploads/products/')) {
            const formattedUrl = `${serverBaseUrl}/${cleanUrl}`;
            // console.log('URL already has uploads/products path, formatted as:', formattedUrl);
            return formattedUrl;
        } else {
            const formattedUrl = `${serverBaseUrl}/uploads/products/${cleanUrl}`;
            // console.log('Added uploads/products path, formatted as:', formattedUrl);
            return formattedUrl;
        }
    }

    // Handle paths that include 'uploads/' but don't have a leading slash
    if (cleanUrl.includes('uploads/')) {
        const formattedUrl = cleanUrl.startsWith('/') ? `${serverBaseUrl}${cleanUrl}` : `${serverBaseUrl}/${cleanUrl}`;
        // console.log('URL contains uploads, formatted as:', formattedUrl);
        return formattedUrl;
    }

    // If it's just a filename without path information, assume it's a product image
    if (!cleanUrl.includes('/')) {
        const formattedUrl = `${serverBaseUrl}/uploads/products/${cleanUrl}`;
        // console.log('Treating as relative product path, formatted as:', formattedUrl);
        return formattedUrl;
    }

    // Last resort: try with the server base URL
    const formattedUrl = `${serverBaseUrl}/${cleanUrl}`;
    // console.log('Last resort formatting with server base URL:', formattedUrl);
    return formattedUrl;
}

// Function to get a base64 placeholder image
export function getPlaceholderImage() {
    // Simple gray placeholder image with "No Image" text
    return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNlMGUwZTAiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzc1NzU3NSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
}