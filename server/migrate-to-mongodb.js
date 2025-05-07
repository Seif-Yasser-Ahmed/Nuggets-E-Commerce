// Script to run data migration from MySQL to MongoDB
const { migrateData } = require('./utils/migrateData');

console.log('Starting migration from MySQL to MongoDB...');
console.log('This process will:');
console.log('1. Connect to both MySQL and MongoDB databases');
console.log('2. Copy all data from MySQL tables to MongoDB collections');
console.log('3. Transform relationships to use MongoDB ObjectIds');
console.log('4. Preserve all your existing data and relationships');
console.log('------------------------------------------------------');

// Run the migration
migrateData()
    .then(() => {
        console.log('------------------------------------------------------');
        console.log('✅ Migration completed successfully!');
        console.log('You can now run your application with MongoDB.');
        console.log('To start the server: npm start');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    });