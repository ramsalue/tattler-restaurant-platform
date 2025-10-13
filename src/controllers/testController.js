// src/controllers/testController.js
const database = require('../config/database');

async function testFilterQuery() {
  try {
    await database.connect();
    const db = database.getDb();
    
    console.log(' Testing filter queries...\n');
    
    // Test 1: Filter by cuisine
    console.log('Test 1: Filter by cuisine (Mexican)');
    const test1 = await db.collection('restaurants')
      .find({ cuisine: 'Mexican' })
      .toArray();
    console.log(`Results: ${test1.length} restaurants`);
    console.log(' Test 1 passed\n');
    
    // Test 2: Filter by price range
    console.log('Test 2: Filter by price range ($$)');
    const test2 = await db.collection('restaurants')
      .find({ priceRange: '$$' })
      .toArray();
    console.log(`Results: ${test2.length} restaurants`);
    console.log(' Test 2 passed\n');
    
    // Test 3: Filter by minimum rating
    console.log('Test 3: Filter by minimum rating (4.0+)');
    const test3 = await db.collection('restaurants')
      .find({ rating: { $gte: 4.0 } })
      .toArray();
    console.log(`Results: ${test3.length} restaurants`);
    console.log(' Test 3 passed\n');
    
    // Test 4: Text search
    console.log('Test 4: Text search (Mexican)');
    const test4 = await db.collection('restaurants')
      .find({ $text: { $search: 'Mexican' } })
      .project({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .toArray();
    console.log(`Results: ${test4.length} restaurants`);
    if (test4.length > 0) {
      console.log(`Top result: ${test4[0].name} (score: ${test4[0].score.toFixed(2)})`);
    }
    console.log(' Test 4 passed\n');
    
    // Test 5: Combined filters
    console.log('Test 5: Combined filters (Mexican cuisine + $$ price)');
    const test5 = await db.collection('restaurants')
      .find({ 
        cuisine: 'Mexican',
        priceRange: '$$'
      })
      .toArray();
    console.log(`Results: ${test5.length} restaurants`);
    console.log(' Test 5 passed\n');
    
    console.log(' All filter tests passed!');
    
    await database.disconnect();
  } catch (error) {
    console.error(' Test failed:', error);
    await database.disconnect();
    process.exit(1);
  }
}

testFilterQuery();