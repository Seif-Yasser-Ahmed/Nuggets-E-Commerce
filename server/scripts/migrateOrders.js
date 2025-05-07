/**
 * migrateOrders.js
 * 
 * One-time migration script to convert legacy order documents to the new format
 * - Finds orders with numeric IDs or missing items array
 * - Converts them to new format with ObjectIds and proper structure
 * - Preserves all existing order data
 * 
 * Run with: node scripts/migrateOrders.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Nuggets';

// Helper function to map legacy fields to new format
function formatShippingAddress(oldAddress) {
  if (!oldAddress) return {};
  
  // Handle both object and string format (some may be stored as JSON strings)
  const address = typeof oldAddress === 'string' ? JSON.parse(oldAddress) : oldAddress;
  
  return {
    fullName: address.fullName || '',
    street: address.street || '',
    address: address.address || '',
    city: address.city || '',
    state: address.state || '',
    zip: address.zip || '',
    country: address.country || '',
    phone: address.phone || ''
  };
}

// Function to find or create an order item
async function createOrderItems(oldOrder) {
  // If the order already has items array, return it
  if (Array.isArray(oldOrder.items) && oldOrder.items.length > 0) {
    return oldOrder.items;
  }
  
  // Create new items array (for legacy orders without items)
  const items = [];
  
  // For legacy orders, try to lookup product info from order_items collection if it exists
  if (oldOrder.product_id) {
    try {
      // Find product using legacy id
      const product = await Product.findOne({ 
        $or: [
          { _id: oldOrder.product_id },
          { _id: mongoose.Types.ObjectId(oldOrder.product_id) }
        ]
      });
      
      if (product) {
        items.push({
          product: product._id,
          name: product.name || 'Product',
          price: oldOrder.price || product.price || 0,
          quantity: oldOrder.quantity || 1,
          image_url: product.image_url || ''
        });
      }
    } catch (error) {
      console.error('Error finding product:', error);
    }
  }
  
  return items;
}

// Function to migrate legacy orders
async function migrateOrders() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully!');

    // Find legacy orders - either with numeric _id or missing items array
    const legacyOrders = await Order.find({
      $or: [
        { _id: { $type: 'number' } },
        { items: { $exists: false } },
        { items: { $size: 0 } }
      ]
    }).lean();

    console.log(`Found ${legacyOrders.length} legacy orders to migrate.`);
    
    if (legacyOrders.length === 0) {
      console.log('No legacy orders found. Migration complete!');
      await mongoose.connection.close();
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each legacy order
    for (const oldOrder of legacyOrders) {
      try {
        console.log(`Migrating order ID: ${oldOrder._id}...`);
        
        // Find user by legacy user_id if available, or keep existing user reference
        let userId = oldOrder.user;
        if (oldOrder.user_id && !mongoose.Types.ObjectId.isValid(oldOrder.user)) {
          const user = await User.findOne({ _id: mongoose.Types.ObjectId(oldOrder.user_id) });
          if (user) {
            userId = user._id;
          } else {
            // If user not found by ObjectId, try finding by numeric ID
            const user = await User.findOne({ _id: oldOrder.user_id });
            if (user) {
              userId = user._id;
            }
          }
        }

        // Ensure we have a valid userId - critical for referential integrity
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
          console.warn(`Invalid user reference for order ${oldOrder._id}, creating placeholder ObjectId`);
          userId = new mongoose.Types.ObjectId();
        }

        // Create items array if missing
        const items = await createOrderItems(oldOrder);
        
        // Format shipping address
        const shippingAddress = formatShippingAddress(oldOrder.shipping_address);
        
        // Create a new order with proper format
        const newOrder = {
          _id: new mongoose.Types.ObjectId(), // Generate new ObjectId
          user: userId,
          items: items,
          total_amount: oldOrder.total_amount || 0,
          shipping_address: shippingAddress,
          payment_method: oldOrder.payment_method || 'cash_on_delivery',
          status: oldOrder.status || 'pending',
          created_at: oldOrder.created_at || new Date(),
          updated_at: oldOrder.updated_at || new Date()
        };

        // Delete the old order
        await Order.deleteOne({ _id: oldOrder._id });
        
        // Create the new order
        const savedOrder = await Order.create(newOrder);
        console.log(`Successfully migrated order: old ID ${oldOrder._id} -> new ID ${savedOrder._id}`);
        successCount++;
      } catch (error) {
        console.error(`Failed to migrate order ID ${oldOrder._id}:`, error);
        errorCount++;
      }
    }

    console.log('Migration summary:');
    console.log(`- Total orders processed: ${legacyOrders.length}`);
    console.log(`- Successfully migrated: ${successCount}`);
    console.log(`- Failed to migrate: ${errorCount}`);
    console.log('Migration complete!');
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateOrders();