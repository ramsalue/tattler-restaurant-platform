const { connectDB, closeDB } = require('./dbConnection');

async function dropAndRecreate() {
  const db = await connectDB();

  try {
    // Verification of collections existance
    const collections = await db.listCollections({ name: 'restaurants' }).toArray();
    
    if (collections.length > 0) {
      console.log('🗑️  Deleting restaurants collections...');
      await db.collection('restaurants').drop();
    }
    
    // Recreate without strict validation (temporal para importar)
    console.log('📦 Creando colección restaurants...');
    await db.createCollection('restaurants');
    
    // Creating indexes
    console.log('📑 Indexes creation...');
    await db.collection('restaurants').createIndexes([
      { key: { name: 'text', cuisine: 'text', description: 'text' } },
      { key: { 'location.city': 1 } },
      { key: { cuisine: 1 } },
      { key: { rating: -1 } },
      { key: { priceRange: 1 } },
      { key: { 'location.coordinates.latitude': 1, 'location.coordinates.longitude': 1 } }
    ]);
    
    console.log('✅ Colection recreated! Now run: node scripts/importData.js');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closeDB();
  }
}

dropAndRecreate();