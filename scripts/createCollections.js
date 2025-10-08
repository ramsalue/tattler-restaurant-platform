// scripts/createCollections.js
/*
  1. It imports the connectDB and closeDB functions from dbConnection.js.
  2. It connects to the database using connectDB().
  3. It then executes db.createCollection() for each of the four collections (restaurants, users, ratings, comments). 
     For each one, it passes a validator object which enforces the strict $jsonSchema rules. This ensures data integrity at the database level.
  4. After creating each collection, it calls db.collection(...).createIndexes() to create multiple indexes that will 
     speed up future queries (like searching by text, filtering by city, or sorting by rating).
  5. It uses a try...catch...finally block to handle errors and ensure that the database connection is always closed at the end with closeDB().
*/
const { connectDB, closeDB } = require('./dbConnection');

async function createCollections() {
  const db = await connectDB();

  try {
    // Create restaurants collection
    await db.createCollection('restaurants', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'cuisine', 'location'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'Restaurant name - required'
            },
            cuisine: {
              bsonType: 'string',
              description: 'Cuisine type - required'
            },
            location: {
              bsonType: 'object',
              required: ['address', 'city', 'coordinates'],
              properties: {
                address: { bsonType: 'string' },
                city: { bsonType: 'string' },
                state: { bsonType: 'string' },
                zipCode: { bsonType: 'string' },
                coordinates: {
                  bsonType: 'object',
                  required: ['latitude', 'longitude'],
                  properties: {
                    latitude: { bsonType: 'double' },
                    longitude: { bsonType: 'double' }
                  }
                }
              }
            },
            priceRange: {
              bsonType: 'string',
              enum: ['$', '$$', '$$$', '$$$$']
            },
            rating: {
              bsonType: 'double',
              minimum: 0,
              maximum: 5
            },
            totalRatings: {
              bsonType: 'int',
              minimum: 0
            },
            amenities: {
              bsonType: 'array',
              items: { bsonType: 'string' }
            },
            phone: { bsonType: 'string' },
            website: { bsonType: 'string' },
            description: { bsonType: 'string' },
            images: {
              bsonType: 'array',
              items: { bsonType: 'string' }
            },
            openingHours: { bsonType: 'object' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });
    console.log('Created restaurants collection');

    // Create indexes for restaurants
    await db.collection('restaurants').createIndexes([
      { key: { name: 'text', cuisine: 'text', description: 'text' } },
      { key: { 'location.city': 1 } },
      { key: { cuisine: 1 } },
      { key: { rating: -1 } },
      { key: { priceRange: 1 } },
      { key: { 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 } }
    ]);
    console.log('Created indexes for restaurants');

    // Create ratings collection
    await db.createCollection('ratings', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['restaurantId', 'userId', 'rating'],
          properties: {
            restaurantId: {
              bsonType: 'objectId',
              description: 'Reference to restaurant - required'
            },
            userId: {
              bsonType: 'string',
              description: 'User identifier - required'
            },
            rating: {
              bsonType: 'int',
              minimum: 1,
              maximum: 5,
              description: 'Rating value 1-5 - required'
            },
            review: {
              bsonType: 'string',
              description: 'Optional review text'
            },
            createdAt: {
              bsonType: 'date'
            }
          }
        }
      }
    });
    console.log('Created ratings collection');

    await db.collection('ratings').createIndexes([
      { key: { restaurantId: 1 } },
      { key: { userId: 1 } },
      { key: { createdAt: -1 } }
    ]);
    console.log('Created indexes for ratings');

    // Create comments collection
    await db.createCollection('comments', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['restaurantId', 'userId', 'comment'],
          properties: {
            restaurantId: { bsonType: 'objectId' },
            userId: { bsonType: 'string' },
            username: { bsonType: 'string' },
            comment: { bsonType: 'string' },
            createdAt: { bsonType: 'date' },
            updatedAt: { bsonType: 'date' }
          }
        }
      }
    });
    console.log('Created comments collection');

    await db.collection('comments').createIndexes([
      { key: { restaurantId: 1 } },
      { key: { userId: 1 } },
      { key: { createdAt: -1 } }
    ]);
    console.log('Created indexes for comments');

    // Create users collection (for preferences)
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['userId', 'email'],
          properties: {
            userId: { bsonType: 'string' },
            email: { bsonType: 'string' },
            username: { bsonType: 'string' },
            preferences: {
              bsonType: 'object',
              properties: {
                favoriteCuisines: {
                  bsonType: 'array',
                  items: { bsonType: 'string' }
                },
                preferredPriceRange: {
                  bsonType: 'array',
                  items: { bsonType: 'string' }
                },
                dietaryRestrictions: {
                  bsonType: 'array',
                  items: { bsonType: 'string' }
                }
              }
            },
            favoriteRestaurants: {
              bsonType: 'array',
              items: { bsonType: 'objectId' }
            },
            createdAt: { bsonType: 'date' }
          }
        }
      }
    });
    console.log('Created users collection');

    await db.collection('users').createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { email: 1 }, unique: true }
    ]);
    console.log('Created indexes for users');

    console.log('\n All collections and indexes created successfully!');
  } catch (error) {
    console.error('Error creating collections:', error);
  } finally {
    await closeDB();
  }
}

// Run the script
createCollections();