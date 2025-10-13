// scripts/importData.js
/*
  1. It imports connectDB and closeDB.
  2. It includes a helper function parseCSV() to read the .csv files and convert them into an ARRAY of JavaScript objects.
  3. The importRestaurants() function reads restaurants.csv and maps over each row. For each restaurant, 
     it creates a document object, ensuring the data types match the schema. 
  5. The importAllData() calls the functions to import both restaurants and users, and then closes the connection.
*/
const { MongoClient, Double, Int32 } = require('mongodb');  // ← Add Double and Int32
const fs = require('fs');
const path = require('path');
const { connectDB, closeDB } = require('./dbConnection');


// Simple CSV parser
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    data.push(obj);
  }
  
  return data;
}

async function importRestaurants() {
  const db = await connectDB();
  
  try {
    const restaurantsData = parseCSV(path.join(__dirname, '../data/csv/restaurants.csv'));
    
    const restaurants = restaurantsData.map(row => ({
      name: row.name,
      cuisine: row.cuisine,
      location: {
        address: row.address,
        city: row.city,
        state: row.state,
        zipCode: row.zipCode,
        coordinates: {
          type: 'Point',
          coordinates: [
          // GeoJSON format is ALWAYS [longitude, latitude]
          new Double(parseFloat(row.longitude)),
          new Double(parseFloat(row.latitude))
          ]
        }
      },
      priceRange: row.priceRange,
      rating: new Double(0.0),              // ← Force DOUBLE BSON type
      totalRatings: new Int32(0),           // ← Force INT32 type
      amenities: ['WiFi', 'Parking'],
      phone: row.phone,
      website: row.website,
      description: row.description,
      images: [],
      openingHours: {
        monday: '9:00 AM - 10:00 PM',
        tuesday: '9:00 AM - 10:00 PM',
        wednesday: '9:00 AM - 10:00 PM',
        thursday: '9:00 AM - 10:00 PM',
        friday: '9:00 AM - 11:00 PM',
        saturday: '10:00 AM - 11:00 PM',
        sunday: '10:00 AM - 9:00 PM'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log('\n Document to insert (BSON):');
    console.log(JSON.stringify(restaurants[0], null, 2));

    const result = await db.collection('restaurants').insertMany(restaurants);
    console.log(`Imported ${result.insertedCount} restaurants`);
    
  } catch (error) {
    console.error('Error importing restaurants:', error);
    if (error.writeErrors) {
      console.error('\n Error details:');
      console.error(JSON.stringify(error.writeErrors[0], null, 2));
    }
  }
}

async function importUsers() {
  const db = await connectDB();
  
  try {
    const usersData = parseCSV(path.join(__dirname, '../data/csv/users.csv'));
    
    const users = usersData.map(row => ({
      userId: row.userId,
      email: row.email,
      username: row.username,
      preferences: {
        favoriteCuisines: row.favoriteCuisines.split(';'),
        preferredPriceRange: row.preferredPriceRange.split(';'),
        dietaryRestrictions: []
      },
      favoriteRestaurants: [],
      createdAt: new Date()
    }));

    const result = await db.collection('users').insertMany(users);
    console.log(` Imported ${result.insertedCount} users`);
    
  } catch (error) {
    console.error(' Error importing users:', error);
  }
}

async function importAllData() {
  console.log(' Starting data import...\n');
  
  await importRestaurants();
  await importUsers();
  
  console.log('\n Data import completed!');
  await closeDB();
}

// Run the import
importAllData();