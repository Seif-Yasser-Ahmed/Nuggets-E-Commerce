// Migration script for transferring data from JSON files to MongoDB
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import MongoDB models
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Review = require('../models/reviewModel');
const Wishlist = require('../models/wishlistModel');

dotenv.config();

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nuggets_db';

// ID mapping (MySQL ID to MongoDB ID)
const userIdMap = new Map();
const productIdMap = new Map();

// JSON files directory - update this path to your downloads directory
const jsonDir = 'C:\\Users\\Seif Yasser\\Downloads\\db';

async function connectToMongo() {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

// Read JSON file
function readJsonFile(filename) {
    try {
        const filePath = path.join(jsonDir, filename);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return null;
    try {
        // Handle MySQL formatted dates
        return new Date(dateString);
    } catch (error) {
        console.error(`Error formatting date: ${dateString}`, error);
        return null;
    }
}

// Migrate users
async function migrateUsers() {
    try {
        console.log('Migrating users...');

        // Clear existing users in MongoDB
        await User.deleteMany({});

        // Get users from JSON file
        const users = readJsonFile('user.json');

        if (users.length === 0) {
            console.log('No users found in JSON file.');
            return;
        }

        // Insert users into MongoDB
        for (const user of users) {
            // Parse social links if they exist and are in string format
            let socialLinks = {};
            if (user.social_links) {
                if (typeof user.social_links === 'string') {
                    try {
                        socialLinks = JSON.parse(user.social_links);
                    } catch (e) {
                        console.log(`Could not parse social_links for user ${user.id}: ${e.message}`);
                    }
                } else if (typeof user.social_links === 'object') {
                    socialLinks = user.social_links;
                }
            }

            const newUser = new User({
                username: user.username,
                email: user.email,
                password: user.password, // Note: passwords are already hashed
                personal_image: user.personal_image,
                location: user.location,
                bio: user.bio || '',
                occupation: user.occupation || '',
                birthday: formatDate(user.birthday),
                isAdmin: Boolean(user.isAdmin),
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                telephone: user.telephone || '',
                social_links: socialLinks,
                created_at: formatDate(user.created_at),
                modified_at: formatDate(user.modified_at)
            });

            const savedUser = await newUser.save();
            userIdMap.set(user.id, savedUser._id.toString());
        }

        console.log(`Migrated ${users.length} users`);
    } catch (error) {
        console.error('Error migrating users:', error);
    }
}

// Migrate products
async function migrateProducts() {
    try {
        console.log('Migrating products...');

        // Clear existing products in MongoDB
        await Product.deleteMany({});

        // Get products from JSON file
        const products = readJsonFile('product.json');

        if (products.length === 0) {
            console.log('No products found in JSON file.');
            return;
        }

        // Insert products into MongoDB
        for (const product of products) {
            // Handle JSON parsing for fields that might be stored as strings
            let specs = {};
            let colors = [];
            let sizes = [];

            if (product.specs) {
                if (typeof product.specs === 'string') {
                    try {
                        specs = JSON.parse(product.specs);
                    } catch (e) {
                        console.log(`Could not parse specs for product ${product.id}: ${e.message}`);
                    }
                } else if (typeof product.specs === 'object') {
                    specs = product.specs;
                }
            }

            if (product.colors) {
                if (typeof product.colors === 'string') {
                    try {
                        colors = JSON.parse(product.colors);
                    } catch (e) {
                        console.log(`Could not parse colors for product ${product.id}: ${e.message}`);
                    }
                } else if (Array.isArray(product.colors)) {
                    colors = product.colors;
                }
            }

            if (product.sizes) {
                if (typeof product.sizes === 'string') {
                    try {
                        sizes = JSON.parse(product.sizes);
                    } catch (e) {
                        console.log(`Could not parse sizes for product ${product.id}: ${e.message}`);
                    }
                } else if (Array.isArray(product.sizes)) {
                    sizes = product.sizes;
                }
            }

            const newProduct = new Product({
                name: product.name,
                description: product.description,
                category: product.category,
                price: product.price,
                image_url: product.image_url,
                stock: product.stock || 0,
                discount: product.discount || 0,
                specs: specs,
                colors: colors,
                sizes: sizes,
                rating: product.rating || 0,
                review_count: product.review_count || 0,
                created_at: formatDate(product.created_at),
                modified_at: formatDate(product.modified_at)
            });

            const savedProduct = await newProduct.save();
            productIdMap.set(product.id, savedProduct._id.toString());
        }

        console.log(`Migrated ${products.length} products`);
    } catch (error) {
        console.error('Error migrating products:', error);
    }
}

// Migrate reviews
async function migrateReviews() {
    try {
        console.log('Migrating reviews...');

        // Clear existing reviews in MongoDB
        await Review.deleteMany({});

        // Get reviews from JSON file
        const reviews = readJsonFile('reviews.json');

        if (reviews.length === 0) {
            console.log('No reviews found in JSON file.');
            return;
        }

        // Track product ratings for update
        const productRatings = {};

        // Insert reviews into MongoDB
        for (const review of reviews) {
            const userId = userIdMap.get(parseInt(review.user_id));
            const productId = productIdMap.get(parseInt(review.product_id));

            if (!userId || !productId) {
                console.log(`Skipping review: missing user ID ${review.user_id} or product ID ${review.product_id} mapping`);
                continue;
            }

            const newReview = new Review({
                product: productId,
                user: userId,
                rating: review.rating,
                comment: review.comment,
                created_at: formatDate(review.created_at)
            });

            await newReview.save();

            // Track ratings for aggregation
            if (!productRatings[productId]) {
                productRatings[productId] = {
                    sum: 0,
                    count: 0
                };
            }
            productRatings[productId].sum += review.rating;
            productRatings[productId].count += 1;
        }

        // Update product ratings
        for (const [productId, ratingData] of Object.entries(productRatings)) {
            const avgRating = ratingData.sum / ratingData.count;
            await Product.findByIdAndUpdate(productId, {
                rating: Math.round(avgRating * 10) / 10,
                review_count: ratingData.count
            });
        }

        console.log(`Migrated ${reviews.length} reviews`);
    } catch (error) {
        console.error('Error migrating reviews:', error);
    }
}

// Migrate wishlist
async function migrateWishlists() {
    try {
        console.log('Migrating wishlists...');

        // Clear existing wishlists in MongoDB
        await Wishlist.deleteMany({});

        // Get wishlists and wishlist items from JSON files
        const wishlists = readJsonFile('wishlist.json');
        const wishlistItems = readJsonFile('wishlist_item.json');

        if (wishlists.length === 0 || wishlistItems.length === 0) {
            console.log('No wishlist data found in JSON files.');
            return;
        }

        // Map wishlist IDs to user IDs
        const wishlistIdMap = new Map();
        for (const list of wishlists) {
            wishlistIdMap.set(list.id, list.user_id);
        }

        // Group items by user
        const userWishlists = {};

        for (const item of wishlistItems) {
            const userId = wishlistIdMap.get(parseInt(item.wishlist_id));
            if (!userId) continue;

            const mongoUserId = userIdMap.get(parseInt(userId));
            const productId = productIdMap.get(parseInt(item.product_id));

            if (!mongoUserId || !productId) {
                console.log(`Skipping wishlist item: missing user or product mapping`);
                continue;
            }

            if (!userWishlists[mongoUserId]) {
                userWishlists[mongoUserId] = {
                    user: mongoUserId,
                    products: []
                };
            }

            userWishlists[mongoUserId].products.push(productId);
        }

        // Insert wishlists into MongoDB
        for (const userId in userWishlists) {
            const newWishlist = new Wishlist(userWishlists[userId]);
            await newWishlist.save();
        }

        console.log(`Migrated wishlists for ${Object.keys(userWishlists).length} users`);
    } catch (error) {
        console.error('Error migrating wishlists:', error);
    }
}

// Migrate cart items
async function migrateCart() {
    try {
        console.log('Migrating cart items...');

        // Clear existing carts in MongoDB
        await Cart.deleteMany({});

        // Get cart items from JSON file
        const cartItems = readJsonFile('cart.json');

        if (cartItems.length === 0) {
            console.log('No cart items found in JSON file.');
            return;
        }

        // Group cart items by user
        const userCarts = {};

        for (const item of cartItems) {
            const userId = userIdMap.get(parseInt(item.user_id));
            const productId = productIdMap.get(parseInt(item.product_id));

            if (!userId || !productId) {
                console.log(`Skipping cart item: missing user ID ${item.user_id} or product ID ${item.product_id} mapping`);
                continue;
            }

            if (!userCarts[userId]) {
                userCarts[userId] = {
                    user: userId,
                    items: []
                };
            }

            userCarts[userId].items.push({
                product: productId,
                quantity: item.quantity || 1
            });
        }

        // Insert carts into MongoDB
        for (const userId in userCarts) {
            const newCart = new Cart(userCarts[userId]);
            await newCart.save();
        }

        console.log(`Migrated cart items for ${Object.keys(userCarts).length} users`);
    } catch (error) {
        console.error('Error migrating cart items:', error);
    }
}

// Migrate orders
async function migrateOrders() {
    try {
        console.log('Migrating orders...');

        // Clear existing orders in MongoDB
        await Order.deleteMany({});

        // Get orders and order items from JSON files
        const orders = readJsonFile('orders.json');
        const orderItems = readJsonFile('order_items.json');

        if (orders.length === 0) {
            console.log('No orders found in JSON file.');
            return;
        }

        // Group order items by order
        const orderItemsMap = {};
        for (const item of orderItems) {
            const orderId = item.order_id;
            if (!orderItemsMap[orderId]) {
                orderItemsMap[orderId] = [];
            }
            orderItemsMap[orderId].push(item);
        }

        // Insert orders into MongoDB
        for (const order of orders) {
            const userId = userIdMap.get(parseInt(order.user_id));
            if (!userId) {
                console.log(`Skipping order: missing user ID ${order.user_id} mapping`);
                continue;
            }

            // Process order items
            const items = [];
            const orderItems = orderItemsMap[order.id] || [];

            for (const item of orderItems) {
                const productId = productIdMap.get(parseInt(item.product_id));
                if (!productId) continue;

                // Try to fetch product data to get name and image
                let name = 'Product';
                let imageUrl = '';
                try {
                    const product = await Product.findById(productId);
                    if (product) {
                        name = product.name;
                        imageUrl = product.image_url;
                    }
                } catch (error) {
                    console.log(`Error fetching product ${productId}:`, error);
                }

                items.push({
                    product: productId,
                    name: name,
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    image_url: imageUrl
                });
            }

            // Handle shipping address
            let shippingAddress = {};
            if (order.shipping_address) {
                if (typeof order.shipping_address === 'string') {
                    try {
                        shippingAddress = JSON.parse(order.shipping_address);
                    } catch (e) {
                        console.log(`Could not parse shipping_address for order ${order.id}: ${e.message}`);
                    }
                } else if (typeof order.shipping_address === 'object') {
                    shippingAddress = order.shipping_address;
                }
            }

            const newOrder = new Order({
                user: userId,
                items: items,
                total_amount: order.total_amount || 0,
                shipping_address: shippingAddress,
                payment_method: order.payment_method || 'card',
                status: order.status || 'pending',
                created_at: formatDate(order.created_at),
                updated_at: formatDate(order.updated_at || order.created_at)
            });

            await newOrder.save();
        }

        console.log(`Migrated ${orders.length} orders`);
    } catch (error) {
        console.error('Error migrating orders:', error);
    }
}

// Main migration function
async function migrateJsonData() {
    try {
        await connectToMongo();

        // Run migrations in sequence
        await migrateUsers();
        await migrateProducts();
        await migrateReviews();
        await migrateWishlists();
        await migrateCart();
        await migrateOrders();

        console.log('Migration from JSON files completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close connections
        mongoose.disconnect();
    }
}

// Run migration when script is executed directly
if (require.main === module) {
    migrateJsonData();
}

module.exports = { migrateJsonData };