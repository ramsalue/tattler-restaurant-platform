// scripts/performanceTest.js
const database = require('../src/config/database');

async function measureQueryPerformance() {
  try {
    await database.connect();
    const db = database.getDb();
    
    console.log(' Performance Testing\n');
    console.log('=' .repeat(60));
    
    // Test 1: Simple get all restaurants
    console.log('\n Test 1: Get All Restaurants (no filters)');
    let start = Date.now();
    const test1 = await db.collection('restaurants').find({}).limit(20).toArray();
    let duration = Date.now() - start;
    console.log(`   Results: ${test1.length} restaurants`);
    console.log(`  Time: ${duration}ms`);
    console.log(`  Status: ${duration < 100 ? 'PASS' : 'SLOW'}`);
    
    // Test 2: Text search
    console.log('\n Test 2: Text Search');
    start = Date.now();
    const test2 = await db.collection('restaurants')
      .find({ $text: { $search: 'Mexican' } })
      .project({ score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .toArray();
    duration = Date.now() - start;
    console.log(`  Results: ${test2.length} restaurants`);
    console.log(`  Time: ${duration}ms`);
    console.log(`  Status: ${duration < 100 ? 'PASS' : 'SLOW'}`);
    
    // Test 3: Filter by cuisine
    console.log('\n Test 3: Filter by Cuisine');
    start = Date.now();
    const test3 = await db.collection('restaurants')
      .find({ cuisine: 'Mexican' })
      .limit(20)
      .toArray();
    duration = Date.now() - start;
    console.log(`   Results: ${test3.length} restaurants`);
    console.log(`   Time: ${duration}ms`);
    console.log(`   Status: ${duration < 50 ? 'PASS' : 'SLOW'}`);
    
    // Test 4: Multiple filters
    console.log('\n Test 4: Multiple Filters (cuisine + priceRange + rating)');
    start = Date.now();
    const test4 = await db.collection('restaurants')
      .find({
        cuisine: 'Mexican',
        priceRange: '$$',
        rating: { $gte: 3.0 }
      })
      .limit(20)
      .toArray();
    duration = Date.now() - start;
    console.log(`  Results: ${test4.length} restaurants`);
    console.log(`  Time: ${duration}ms`);
    console.log(`  Status: ${duration < 100 ? 'PASS' : 'SLOW'}`);
    
    // Test 5: Geospatial query
    console.log('\n Test 5: Geospatial Query (nearby)');
    start = Date.now();
    const test5 = await db.collection('restaurants')
      .find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [-99.1332, 19.4326]
            },
            $maxDistance: 5000
          }
        }
      })
      .limit(20)
      .toArray();
    duration = Date.now() - start;
    console.log(`   Results: ${test5.length} restaurants`);
    console.log(`   Time: ${duration}ms`);
    console.log(`   Status: ${duration < 150 ? 'PASS' : 'SLOW'}`);
    
    // Test 6: Aggregation (statistics)
    console.log('\n Test 6: Aggregation Pipeline (statistics)');
    start = Date.now();
    const test6 = await db.collection('restaurants').aggregate([
      {
        $facet: {
          byCuisine: [
            { $group: { _id: '$cuisine', count: { $sum: 1 } } }
          ],
          ratingStats: [
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalRestaurants: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]).toArray();
    duration = Date.now() - start;
    console.log(`   Results: Statistics calculated`);
    console.log(`   Time: ${duration}ms`);
    console.log(`   Status: ${duration < 200 ? 'PASS' : 'SLOW'}`);
    
    // Test 7: Sort by rating
    console.log('\n Test 7: Sort by Rating (descending)');
    start = Date.now();
    const test7 = await db.collection('restaurants')
      .find({})
      .sort({ rating: -1 })
      .limit(20)
      .toArray();
    duration = Date.now() - start;
    console.log(`   Results: ${test7.length} restaurants`);
    console.log(`   Time: ${duration}ms`);
    console.log(`   Status: ${duration < 50 ? 'PASS' : 'SLOW'}`);
    
    // Test 8: Pagination with skip
    console.log('\n Test 8: Pagination (page 2, limit 10)');
    start = Date.now();
    const test8 = await db.collection('restaurants')
      .find({})
      .skip(10)
      .limit(10)
      .toArray();
    duration = Date.now() - start;
    console.log(`   Results: ${test8.length} restaurants`);
    console.log(`   Time: ${duration}ms`);
    console.log(`   Status: ${duration < 100 ? 'PASS' : 'SLOW'}`);
    
    console.log('\n' + '='.repeat(60));
    console.log(' Performance testing completed!\n');
    
    await database.disconnect();
  } catch (error) {
    console.error(' Performance test error:', error);
    await database.disconnect();
    process.exit(1);
  }
}

measureQueryPerformance();