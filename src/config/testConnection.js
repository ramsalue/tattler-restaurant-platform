// src/config/testConnection.js
// Import the single database instance we created in the other file.
const database = require('./database');

async function testConnection() {
  try {
    console.log(' Testing MongoDB connection...');

    // Call the connect method.
    const db = await database.connect();

    // Run a simple test query to list all collections.
    const collections = await db.listCollections().toArray();
    console.log(` Found ${collections.length} collections:`);
    collections.forEach(col => console.log(`   - ${col.name}`));

    // Run another test query to count documents in the 'restaurants' collection.
    const restaurantsCount = await db.collection('restaurants').countDocuments();
    console.log(` Restaurants in database: ${restaurantsCount}`);

    // Disconnect when done.
    await database.disconnect();
    console.log(' Connection test successful!');
  } catch (error) {
    console.error(' Connection test failed:', error.message);
    process.exit(1); // Exit with an error code if the test fails.
  }
}

// Run the test function.
testConnection();