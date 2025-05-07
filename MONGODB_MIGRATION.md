# MongoDB Migration Guide for Nuggets E-commerce

This guide explains how to migrate your Nuggets e-commerce application from MySQL to MongoDB using Mongoose.

## Migration Overview

We've updated your codebase to use MongoDB with Mongoose instead of MySQL. The migration includes:

1. New Mongoose schema models replacing MySQL tables
2. Updated controllers to use MongoDB queries
3. Client-side services adapted to work with MongoDB ObjectIds
4. A data migration utility to transfer existing data

## Prerequisites

- MongoDB installed locally or a MongoDB Atlas account
- Node.js and npm installed
- MySQL server running with your existing data

## Installation Steps

1. **Install MongoDB dependencies**:
   ```bash
   cd server
   npm install mongoose
   ```

2. **Configure MongoDB connection**:
   - Copy the `.env.example` file to `.env` if you don't already have one
   - Update the `MONGO_URI` value in your `.env` file:
   ```
   MONGO_URI=mongodb://localhost:27017/nuggets_db
   ```
   Or use your MongoDB Atlas connection string.

3. **Run the data migration script**:
   ```bash
   cd server
   node migrate-to-mongodb.js
   ```
   This will copy your data from MySQL to MongoDB.

4. **Start your application with MongoDB**:
   ```bash
   cd server
   npm start
   ```

## Database Models

We've created the following Mongoose models:

- `userModel.js`: User accounts, profiles, and authentication
- `productModel.js`: Product catalog with details, pricing, and inventory
- `cartModel.js`: Shopping cart functionality
- `orderModel.js`: Orders with items and shipping information
- `reviewModel.js`: Product reviews and ratings
- `wishlistModel.js`: User wishlists

## Key Changes

### Server-Side Changes:

- MongoDB connection in `server.js` and `db.js`
- Mongoose models in the `models` directory
- Controllers updated to use Mongoose queries
- Data migration utility in `utils/migrateData.js`

### Client-Side Changes:

- Added MongoDB ObjectId validation in API services
- Updated ID handling in service calls to work with MongoDB's ObjectId format
- Helper functions to ensure backward compatibility

## Troubleshooting

If you encounter issues during migration:

- **Connection errors**: Check your MongoDB connection string and ensure MongoDB is running
- **Data migration failures**: Ensure MySQL server is running and accessible
- **Client-side errors**: Check for ID format issues or update any hard-coded ID references

## MongoDB vs. MySQL Differences

- **ID Format**: MongoDB uses 24-character hexadecimal ObjectIds instead of numeric IDs
- **Schema Flexibility**: MongoDB documents can have varying fields within a collection
- **Relationships**: MongoDB uses references or embedded documents instead of foreign keys
- **Queries**: MongoDB uses different query patterns compared to SQL

## Next Steps

After migrating:

1. Test all functionality thoroughly
2. Update any remaining hard-coded ID references
3. Consider adding indexes to improve query performance
4. Remove MySQL dependency after successful migration

For any issues, check the MongoDB and Mongoose documentation:
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)