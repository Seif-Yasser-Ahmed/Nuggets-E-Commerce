// Migration script for transferring data from MySQL to MongoDB
const mysql = require('mysql');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

// Import MongoDB models
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const Review = require('../models/reviewModel');
const Wishlist = require('../models/wishlistModel');

dotenv.config();

// MySQL connection
const mysqlDb = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// MongoDB connection
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nuggets_db';

// ID mapping (MySQL ID to MongoDB ID)
const userIdMap = new Map();
const productIdMap = new Map();
const categoryIdMap = new Map();
const inventoryIdMap = new Map();
const wishlistIdMap = new Map();

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

function connectToMysql() {
    return new Promise((resolve, reject) => {
        mysqlDb.connect(err => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                return reject(err);
            }
            console.log('Connected to MySQL');
            resolve();
        });
    });
}

// Helper function to execute MySQL queries
function queryMysql(sql, params = []) {
    return new Promise((resolve, reject) => {
        mysqlDb.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// Migrate users
async function migrateUsers() {
    try {
        console.log('Migrating users...');

        // Clear existing users in MongoDB
        await User.deleteMany({});

        // Get users from MySQL
        const users = await queryMysql('SELECT * FROM user');

        // Get user addresses
        const addresses = await queryMysql('SELECT * FROM user_address');
        const addressesByUser = {};
        for (const addr of addresses) {
            addressesByUser[addr.user_id] = addr;
        }

        // Get user payment methods
        const payments = await queryMysql('SELECT * FROM user_payment');
        const paymentsByUser = {};
        for (const payment of payments) {
            if (!paymentsByUser[payment.user_id]) {
                paymentsByUser[payment.user_id] = [];
            }
            paymentsByUser[payment.user_id].push({
                payment_type: payment.payment_type,
                provider: payment.provider,
                account_no: payment.account_no,
                expiry: payment.expiry
            });
        }

        // Insert users into MongoDB
        for (const user of users) {
            // Prepare address data if exists
            const address = addressesByUser[user.id];
            const addressData = address ? {
                address_line1: address.address_line1,
                address_line2: address.address_line2,
                city: address.city,
                postal_code: address.postal_code,
                country: address.country,
                telephone: address.telephone,
                mobile: address.mobile
            } : {};

            // Prepare payment methods if exist
            const paymentMethods = paymentsByUser[user.id] || [];

            const newUser = new User({
                username: user.username,
                email: user.email,
                password: user.password, // Note: passwords are already hashed
                personal_image: user.personal_image,
                location: user.location,
                bio: user.bio,
                occupation: user.occupation,
                birthday: user.birthday,
                isAdmin: Boolean(user.isAdmin),
                first_name: user.first_name,
                last_name: user.last_name,
                telephone: user.telephone,
                social_links: user.social_links ? JSON.parse(user.social_links) : {},
                address: addressData,
                payment_methods: paymentMethods,
                created_at: user.created_at,
                modified_at: user.modified_at
            });

            const savedUser = await newUser.save();
            userIdMap.set(user.id, savedUser._id.toString());
        }

        console.log(`Migrated ${users.length} users`);
    } catch (error) {
        console.error('Error migrating users:', error);
    }
}

// Migrate product categories
async function migrateProductCategories() {
    try {
        console.log('Migrating product categories...');

        // Get categories from MySQL
        const categories = await queryMysql('SELECT * FROM product_category');

        // In MongoDB, we're using categories as strings, not as separate documents
        // So we'll just keep a mapping of IDs for reference when migrating products
        for (const category of categories) {
            categoryIdMap.set(category.id, category.name);
        }

        console.log(`Processed ${categories.length} product categories`);
    } catch (error) {
        console.error('Error migrating product categories:', error);
    }
}

// Migrate product inventory
async function migrateProductInventory() {
    try {
        console.log('Migrating product inventory...');

        // Get inventory from MySQL
        const inventories = await queryMysql('SELECT * FROM product_inventory');

        // We'll use this data when migrating products to update their stock values
        for (const inventory of inventories) {
            inventoryIdMap.set(inventory.id, inventory.quantity || 0);
        }

        console.log(`Processed ${inventories.length} product inventory records`);
    } catch (error) {
        console.error('Error migrating product inventory:', error);
    }
}

// Migrate products
async function migrateProducts() {
    try {
        console.log('Migrating products...');

        // Clear existing products in MongoDB
        await Product.deleteMany({});

        // Get products from MySQL
        const products = await queryMysql('SELECT * FROM product');

        // Insert products into MongoDB
        for (const product of products) {
            // Get category name if available
            const category = categoryIdMap.get(product.category_id) || product.category;

            // Get inventory quantity if available
            const stock = product.inventory_id ?
                inventoryIdMap.get(product.inventory_id) || product.stock || 0 :
                product.stock || 0;

            const newProduct = new Product({
                name: product.name,
                description: product.description,
                category: category,
                price: product.price,
                image_url: product.image_url,
                stock: stock,
                discount: product.discount || 0,
                specs: product.specs ? JSON.parse(product.specs) : {},
                colors: product.colors ? JSON.parse(product.colors) : [],
                sizes: product.sizes ? JSON.parse(product.sizes) : [],
                rating: product.rating || 0,
                review_count: product.review_count || 0,
                created_at: product.created_at,
                modified_at: product.modified_at || product.created_at
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

        // Get reviews from MySQL
        const reviews = await queryMysql('SELECT * FROM reviews');

        // Track product ratings for update
        const productRatings = {};

        // Insert reviews into MongoDB
        for (const review of reviews) {
            const userId = userIdMap.get(review.user_id);
            const productId = productIdMap.get(review.product_id);

            if (!userId || !productId) continue;

            const newReview = new Review({
                product: productId,
                user: userId,
                rating: review.rating,
                comment: review.comment,
                created_at: review.created_at
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
                rating: avgRating,
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

        // Get wishlists from MySQL
        const wishlists = await queryMysql('SELECT * FROM wishlist');

        // Map wishlist IDs
        for (const list of wishlists) {
            wishlistIdMap.set(list.id, list.user_id);
        }

        // Get wishlist items from MySQL
        const wishlistItems = await queryMysql('SELECT * FROM wishlist_item');

        // Group items by user
        const userWishlists = {};

        for (const item of wishlistItems) {
            const userId = wishlistIdMap.get(item.wishlist_id);
            if (!userId) continue;

            const mongoUserId = userIdMap.get(userId);
            const productId = productIdMap.get(item.product_id);

            if (!mongoUserId || !productId) continue;

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

        // Get cart items from MySQL
        const cartItems = await queryMysql('SELECT * FROM cart');

        // Group cart items by user
        const userCarts = {};

        for (const item of cartItems) {
            const userId = userIdMap.get(item.user_id);
            const productId = productIdMap.get(item.product_id);

            if (!userId || !productId) continue;

            if (!userCarts[userId]) {
                userCarts[userId] = {
                    user: userId,
                    items: []
                };
            }

            userCarts[userId].items.push({
                product: productId,
                quantity: item.quantity
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

        // Get orders from MySQL
        const orders = await queryMysql('SELECT * FROM orders');

        // Insert orders into MongoDB
        for (const order of orders) {
            const userId = userIdMap.get(order.user_id);
            if (!userId) continue;

            // Get order items for this order
            const orderItems = await queryMysql('SELECT * FROM order_items WHERE order_id = ?', [order.id]);

            const items = [];
            for (const item of orderItems) {
                const productId = productIdMap.get(item.product_id);
                if (!productId) continue;

                const product = await Product.findById(productId);

                items.push({
                    product: productId,
                    name: product.name,
                    quantity: item.quantity,
                    price: item.price,
                    image_url: product.image_url
                });
            }

            const newOrder = new Order({
                user: userId,
                items: items,
                total_amount: order.total_amount,
                shipping_address: order.shipping_address ? JSON.parse(order.shipping_address) : {},
                payment_method: order.payment_method,
                status: order.status,
                created_at: order.created_at,
                updated_at: order.updated_at
            });

            await newOrder.save();
        }

        console.log(`Migrated ${orders.length} orders`);
    } catch (error) {
        console.error('Error migrating orders:', error);
    }
}

// Main migration function
async function migrateData() {
    try {
        await connectToMongo();
        await connectToMysql();

        // Run migrations in sequence
        await migrateProductCategories();
        await migrateProductInventory();
        await migrateUsers();
        await migrateProducts();
        await migrateReviews();
        await migrateWishlists();
        await migrateCart();
        await migrateOrders();

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        // Close connections
        mongoose.disconnect();
        mysqlDb.end();
    }
}

// Run migration when script is executed directly
if (require.main === module) {
    migrateData();
}

module.exports = { migrateData };