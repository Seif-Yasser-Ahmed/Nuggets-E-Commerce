/**
 * Formats the image URL to ensure it's complete and valid
 * @param {string} url - The image URL that needs to be formatted
 * @returns {string} - The properly formatted image URL
 */
export const formatImageUrl = (url) => {
    if (!url) return '';

    // If the URL is already absolute (starts with http:// or https://), return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it's a relative URL starting with /uploads/, prefix with the API base URL
    if (url.startsWith('/uploads/')) {
        // Get the API base URL from environment or use default
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        return `${baseUrl}${url}`;
    }

    // Return the original URL if it doesn't match any of the above conditions
    return url;
};