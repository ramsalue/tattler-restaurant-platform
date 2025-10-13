// scripts/migrateToGeoJSON.js
const database = require('../src/config/database');

async function migrateToGeoJSON() {
  try {
    // Connect to the database.
    await database.connect();
    const db = database.getDb();

    console.log('Migrating coordinates to GeoJSON format...\n');

    // Find all restaurant documents to process them.
    const restaurants = await db.collection('restaurants').find({}).toArray();
    console.log(`Found ${restaurants.length} restaurants to migrate`);

    let migrated = 0;
    let skipped = 0;

    // Loop through each restaurant document.
    for (const restaurant of restaurants) {
      // Check if the document has already been migrated to the GeoJSON format. This helps to run file more than once
      if (restaurant.location.coordinates && restaurant.location.coordinates.type === 'Point') {
        skipped++;
        continue; // Skip to the next restaurant.
      }

      // Check if the old coordinate format exists.
      if (restaurant.location.coordinates && 
          restaurant.location.coordinates.latitude && 
          restaurant.location.coordinates.longitude) {

        const { latitude, longitude } = restaurant.location.coordinates;

        // Update the document to the new GeoJSON format: [longitude, latitude].
        await db.collection('restaurants').updateOne(
          { _id: restaurant._id },
          {
            $set: {
              'location.coordinates': {
                type: 'Point',
                coordinates: [longitude, latitude] 
              }
            }
          }
        );

        migrated++;
        console.log(`Migrated: ${restaurant.name}`);
      }
    }

    console.log(`\n Migration complete:`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped: ${skipped}`);

    // After migrating the data, create the necessary '2dsphere' index.
    console.log('\n Creating 2dsphere index for geospatial queries...');
    await db.collection('restaurants').createIndex({ 'location.coordinates': '2dsphere' });
    console.log(' Geospatial index created');

    await database.disconnect();
  } catch (error) {
    console.error(' Migration error:', error);
    await database.disconnect();
    process.exit(1);
  }
}

migrateToGeoJSON();