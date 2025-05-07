// Script to run data migration from JSON files to MongoDB
const { migrateJsonData } = require('./utils/jsonToMongo');

console.log('Starting migration from JSON files to MongoDB...');
console.log('This process will:');
console.log('1. Read data from JSON files in C:\\Users\\Seif Yasser\\Downloads\\db');
console.log('2. Transform the data to match MongoDB schemas');
console.log('3. Import the data into MongoDB collections');
console.log('4. Preserve all relationships between entities');
console.log('------------------------------------------------------');

// Run the migration
migrateJsonData()
    .then(() => {
        console.log('------------------------------------------------------');
        console.log('✅ Migration from JSON files completed successfully!');
        console.log('You can now run your application with MongoDB.');
        console.log('To start the server: npm start');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    });