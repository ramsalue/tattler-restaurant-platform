// scripts/checkIndexes.js
// Imports the database module from the 'src' directory.
const database = require('../src/config/database');

async function checkIndexes() {
  try {
    // Connect to the database.
    await database.connect();
    const db = database.getDb();

    console.log('Checking indexes on the restaurants collection...\n');

    // Get a list of all indexes on the collection.
    const indexes = await db.collection('restaurants').indexes();

    console.log('Current indexes:');
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. Name: ${index.name}`);
      console.log(`   Keys:`, JSON.stringify(index.key));
    });

    // Check if an index of type '2dsphere' exists on the coordinates field.
    // This is the specific type of index needed for geospatial queries.
    const hasGeoIndex = indexes.some(idx => idx.key['location.coordinates'] === '2dsphere');

    if (hasGeoIndex) {
      console.log('\n Geospatial index ("2dsphere") found!');
    } else {
      console.log('\n No "2dsphere" geospatial index found. The migration script in the next step will create it.');
    }

    await database.disconnect();
  } catch (error) {
    console.error('Error checking indexes:', error);
    await database.disconnect();
    process.exit(1);
  }
}

// Run the script.
checkIndexes();