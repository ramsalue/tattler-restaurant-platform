// scripts/recreateRestaurantsCollection.js
const { Double, Int32 } = require('mongodb');
const database = require('../src/config/database');

async function recreateCollection() {
  try {
    await database.connect();
    const db = database.getDb();
    
    // --- STEP 1: Backup current data into memory ---
    console.log(' Step 1: Backing up current data...\n');
    
    // Get all current restaurants
    const restaurants = await db.collection('restaurants').find({}).toArray();
    console.log(` Backed up ${restaurants.length} restaurants`);
    

    console.log('\n  Step 2: Dropping old collection...\n');
    // Drop the collection with strict validation
    await db.collection('restaurants').drop();
    console.log(' Collection dropped');
    
    console.log('\n Step 3: Creating new collection without strict validation...\n');
    // Create new collection with minimal validation
    // PASTE THIS NEW, COMPLETE SCHEMA BLOCK
    // PASTE THIS NEW, COMPLETE SCHEMA BLOCK
    await db.createCollection('restaurants', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'cuisine', 'location'],
          properties: {
            name: { bsonType: 'string' },
            cuisine: { bsonType: 'string' },
            location: {
              bsonType: 'object',
              required: ['address', 'city', 'coordinates'],
              properties: {
                address: { bsonType: 'string' },
                city: { bsonType: 'string' },
                coordinates: {
                  bsonType: "object",
                  required: ["type", "coordinates"],
                  properties: {
                    "type": { "bsonType": "string", "enum": ["Point"] },
                    "coordinates": { "bsonType": "array", "minItems": 2, "maxItems": 2, "items": { "bsonType": "double" } }
                  }
                }
              }
            },
            priceRange: { bsonType: 'string' },
            rating: { bsonType: 'double' },
            totalRatings: { bsonType: 'int' }
          }
        }
      }
    });
    console.log(' New collection created with flexible schema');
    
    console.log('\n Step 4: Migrating data to GeoJSON format...\n');
    // Transform and insert data
    const transformedRestaurants = restaurants.map(restaurant => {
      // If the old format exists, transform it.
      if (restaurant.location.coordinates && 
          restaurant.location.coordinates.type === 'Point') {
        return restaurant;
      }
      
      // Transform to GeoJSON
      const { latitude, longitude } = restaurant.location.coordinates || { latitude: 0, longitude: 0 };
      
      return {
        ...restaurant,
        location: {
          ...restaurant.location,
          coordinates: {
            type: 'Point',
            coordinates: [longitude, latitude]  // GeoJSON: [lng, lat]
          }
        },
        // Ensure numeric types are correct BSON types for the new insertion.
        rating: new Double(restaurant.rating || 0.0),
        totalRatings: new Int32(restaurant.totalRatings || 0)
      };
    });
    
    if (transformedRestaurants.length > 0) {
      await db.collection('restaurants').insertMany(transformedRestaurants);
      console.log(`Inserted ${transformedRestaurants.length} restaurants in GeoJSON format`);
    }
    
    console.log('\n Step 5: Creating indexes...\n');
    
    // Create all necessary indexes
    await db.collection('restaurants').createIndexes([
      { key: { name: 'text', cuisine: 'text', description: 'text' } },
      { key: { 'location.city': 1 } },
      { key: { cuisine: 1 } },
      { key: { rating: -1 } },
      { key: { priceRange: 1 } },
      { key: { 'location.coordinates': '2dsphere' } }  // Geospatial index
    ]);
    console.log(' All indexes created');
    
    console.log('\n Migration complete!\n');
    console.log(' Summary:');
    console.log(`   - Restaurants migrated: ${transformedRestaurants.length}`);
    console.log(`   - GeoJSON format: `);
    console.log(`   - Indexes: 6 created`);
    
    await database.disconnect();
  } catch (error) {
    console.error(' Migration error:', error);
    await database.disconnect();
    process.exit(1);
  }
}

recreateCollection();