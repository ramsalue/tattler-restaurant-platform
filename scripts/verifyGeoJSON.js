// scripts/verifyGeoJSON.js
const database = require('../src/config/database');

async function verifyGeoJSON() {
  try {
    await database.connect();
    const db = database.getDb();
    
    console.log(' Verifying GeoJSON migration...\n');
    
    const restaurants = await db.collection('restaurants').find({}).limit(3).toArray();
    
    restaurants.forEach((restaurant, i) => {
      console.log(`Restaurant ${i + 1}: ${restaurant.name}`);
      console.log('Coordinates:', JSON.stringify(restaurant.location.coordinates, null, 2));
      console.log('');
    });
    
    // Check if 2dsphere index exists
    const indexes = await db.collection('restaurants').indexes();
    const has2dsphere = indexes.some(idx => 
      idx.key['location.coordinates'] === '2dsphere'
    );
    
    if (has2dsphere) {
      console.log(' 2dsphere index exists');
    } else {
      console.log('  No 2dsphere index found');
    }
    
    await database.disconnect();
  } catch (error) {
    console.error(' Error:', error);
    await database.disconnect();
  }
}

verifyGeoJSON();