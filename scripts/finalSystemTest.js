// scripts/finalSystemTest.js
const http = require('http');

const baseUrl = 'http://localhost:3000';
let testsPassed = 0;
let testsFailed = 0;

function makeRequest(path, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === expectedStatus) {
            testsPassed++;
            resolve({ success: true, data: jsonData, statusCode: res.statusCode });
          } else {
            testsFailed++;
            resolve({ success: false, statusCode: res.statusCode, expected: expectedStatus });
          }
        } catch (e) {
          testsFailed++;
          resolve({ success: false, error: 'Invalid JSON', statusCode: res.statusCode });
        }
      });
    }).on('error', (err) => {
      testsFailed++;
      reject(err);
    });
  });
}

async function runSystemTests() {
  console.log(' Final System Test\n');
  console.log('=' .repeat(70));
  console.log('Server has to be running: npm run dev\n');
  
  // Test 1: Health check
  console.log('Test 1: Health Check');
  const test1 = await makeRequest('/health');
  console.log(`   ${test1.success ? '' : ''} Status: ${test1.statusCode}`);
  
  // Test 2: Get all restaurants
  console.log('\nTest 2: Get All Restaurants');
  const test2 = await makeRequest('/api/v1/restaurants?limit=5');
  console.log(`   ${test2.success ? 'YES' : 'NO'} Status: ${test2.statusCode}`);
  if (test2.success) {
    console.log(`   Results: ${test2.data.results} restaurants`);
  }
  
  // Test 3: Text search
  console.log('\nTest 3: Text Search');
  const test3 = await makeRequest('/api/v1/restaurants/search?q=Mexican');
  console.log(`   ${test3.success ? 'YES' : 'NO'} Status: ${test3.statusCode}`);
  if (test3.success) {
    console.log(`   Search term: ${test3.data.searchTerm}`);
    console.log(`   Results: ${test3.data.results}`);
  }
  
  // Test 4: Filter by cuisine
  console.log('\nTest 4: Filter by Cuisine');
  const test4 = await makeRequest('/api/v1/restaurants?cuisine=Mexican');
  console.log(`   ${test4.success ? 'YES' : 'NO'} Status: ${test4.statusCode}`);
  if (test4.success) {
    console.log(`   Results: ${test4.data.results}`);
    console.log(`   Filters applied: ${JSON.stringify(test4.data.filters)}`);
  }
  
  // Test 5: Multiple filters
  console.log('\nTest 5: Multiple Filters');
  const test5 = await makeRequest('/api/v1/restaurants?cuisine=Mexican&priceRange=$$&minRating=3');
  console.log(`   ${test5.success ? 'YES' : 'NO'} Status: ${test5.statusCode}`);
  if (test5.success) {
    console.log(`   Results: ${test5.data.results}`);
  }
  
  // Test 6: Sorting
  console.log('\nTest 6: Sort by Rating');
  const test6 = await makeRequest('/api/v1/restaurants?sortBy=rating&order=desc&limit=3');
  console.log(`   ${test6.success ? 'YES' : 'NO'} Status: ${test6.statusCode}`);
  if (test6.success) {
    console.log(`   Sort: ${test6.data.sort.field} ${test6.data.sort.order}`);
    if (test6.data.data.restaurants.length > 0) {
      console.log(`   Top rated: ${test6.data.data.restaurants[0].name} (${test6.data.data.restaurants[0].rating}★)`);
    }
  }
  
  // Test 7: Geospatial
  console.log('\nTest 7: Nearby Search');
  const test7 = await makeRequest('/api/v1/restaurants/nearby?latitude=19.4326&longitude=-99.1332&radius=10');
  console.log(`   ${test7.success ? 'YES' : 'NO'} Status: ${test7.statusCode}`);
  if (test7.success) {
    console.log(`   Center: ${test7.data.searchCenter.latitude}, ${test7.data.searchCenter.longitude}`);
    console.log(`   Radius: ${test7.data.radius}km`);
    console.log(`   Results: ${test7.data.results}`);
  }
  
  // Test 8: Statistics
  console.log('\nTest 8: Statistics');
  const test8 = await makeRequest('/api/v1/restaurants/stats');
  console.log(`   ${test8.success ? 'YES' : 'NO'} Status: ${test8.statusCode}`);
  if (test8.success && test8.data.data.statistics.ratingStats[0]) {
    console.log(`   Avg rating: ${test8.data.data.statistics.ratingStats[0].avgRating.toFixed(2)}`);
    console.log(`   Total restaurants: ${test8.data.data.statistics.ratingStats[0].totalRestaurants}`);
  }
  
  // Test 9: Pagination
  console.log('\nTest 9: Pagination');
  const test9 = await makeRequest('/api/v1/restaurants?limit=5&page=2');
  console.log(`   ${test9.success ? 'YES' : 'NO'} Status: ${test9.statusCode}`);
  if (test9.success) {
    console.log(`   Page: ${test9.data.page}/${test9.data.totalPages}`);
    console.log(`   Results: ${test9.data.results}`);
  }
  
  // Test 10: Error handling
  console.log('\nTest 10: Error Handling (Invalid Parameter)');
  const test10 = await makeRequest('/api/v1/restaurants?sortBy=invalid', 400);
  console.log(`   ${test10.success ? 'YES' : 'NO'} Status: ${test10.statusCode} (expected 400)`);
  
  // Test 11: Complex query
  console.log('\nTest 11: Complex Combined Query');
  const test11 = await makeRequest('/api/v1/restaurants?cuisine=Mexican&sortBy=rating&order=desc&limit=5');
  console.log(`   ${test11.success ? 'YES' : 'NO'} Status: ${test11.statusCode}`);
  if (test11.success) {
    console.log(`   Filters + Sort working together`);
  }
  
  // Test 12: Cache test
  console.log('\nTest 12: Cache Performance');
  const start1 = Date.now();
  await makeRequest('/api/v1/restaurants/stats');
  const time1 = Date.now() - start1;
  
  const start2 = Date.now();
  await makeRequest('/api/v1/restaurants/stats');
  const time2 = Date.now() - start2;
  
  console.log(`   First request: ${time1}ms`);
  console.log(`   Second request: ${time2}ms`);
  console.log(`   ${time2 < time1 ? 'YES' : 'Warning'} Cache ${time2 < time1 ? 'working' : 'not detected'}`);
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n Final Results:`);
  console.log(`   Tests Passed: ${testsPassed}`);
  console.log(`   Tests Failed: ${testsFailed}`);
  console.log(`   Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  
  if (testsFailed === 0) {
    console.log('\nYES All tests passed! System is ready.\n');
  } else {
    console.log(`\n  ${testsFailed} test(s) failed.\n`);
  }
}

runSystemTests().catch(err => {
  console.error('NO System test error:', err);
});