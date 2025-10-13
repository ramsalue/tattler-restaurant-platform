// scripts/loadTest.js
const http = require('http');

const baseUrl = 'http://localhost:3000';

async function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    
    http.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({ duration, statusCode: res.statusCode });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function loadTest() {
  console.log(' Load Testing\n');
  console.log('Server has to be running (npm run dev)\n');
  
  const tests = [
    { name: 'Get All Restaurants', path: '/api/v1/restaurants?limit=10' },
    { name: 'Search Mexican', path: '/api/v1/restaurants/search?q=Mexican' },
    { name: 'Filter by Cuisine', path: '/api/v1/restaurants?cuisine=Italian' },
    { name: 'Filter + Sort', path: '/api/v1/restaurants?cuisine=Mexican&sortBy=rating&order=desc' },
    { name: 'Nearby Search', path: '/api/v1/restaurants/nearby?latitude=19.4326&longitude=-99.1332&radius=10' },
    { name: 'Statistics', path: '/api/v1/restaurants/stats' }
  ];
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    
    const requests = [];
    const concurrentRequests = 10;
    
    // Send 10 concurrent requests
    for (let i = 0; i < concurrentRequests; i++) {
      requests.push(makeRequest(test.path));
    }
    
    try {
      const results = await Promise.all(requests);
      
      const durations = results.map(r => r.duration);
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      const allSuccess = results.every(r => r.statusCode === 200);
      
      console.log(`   Concurrent requests: ${concurrentRequests}`);
      console.log(`   Success rate: ${allSuccess ? '100%' : 'FAILED'}`);
      console.log(`   Avg response time: ${avgDuration.toFixed(2)}ms`);
      console.log(`   Min: ${minDuration}ms | Max: ${maxDuration}ms`);
      console.log(`   Status: ${avgDuration < 200 ? 'PASS' : 'SLOW'}\n`);
    } catch (error) {
      console.error(`   Error: ${error.message}\n`);
    }
  }
  
  console.log(' Load testing completed!\n');
}

loadTest();