// scripts/analyzeQueries.js
const database = require('../src/config/database');

async function analyzeQueryPerformance() {
  try {
    await database.connect();
    const db = database.getDb();
    
    console.log(' Query Analysis\n');
    
    // Analyze text search
    console.log('  Analyzing Text Search Query:');
    const explainSearch = await db.collection('restaurants')
      .find({ $text: { $search: 'Mexican' } })
      .explain('executionStats');
    
    console.log(`   Documents examined: ${explainSearch.executionStats.totalDocsExamined}`);
    console.log(`   Documents returned: ${explainSearch.executionStats.nReturned}`);
    console.log(`   Execution time: ${explainSearch.executionStats.executionTimeMillis}ms`);
    console.log(`   Index used: ${explainSearch.executionStats.executionStages.indexName || 'N/A'}`);
    
    // Analyze filter query
    console.log('\n  Analyzing Filter Query (cuisine):');
    const explainFilter = await db.collection('restaurants')
      .find({ cuisine: 'Mexican' })
      .explain('executionStats');
    
    console.log(`   Documents examined: ${explainFilter.executionStats.totalDocsExamined}`);
    console.log(`   Documents returned: ${explainFilter.executionStats.nReturned}`);
    console.log(`   Execution time: ${explainFilter.executionStats.executionTimeMillis}ms`);
    console.log(`   Index used: ${explainFilter.executionStats.executionStages.indexName || 'COLLSCAN'}`);
    
    // Analyze geospatial query
    console.log('\n  Analyzing Geospatial Query:');
    const explainGeo = await db.collection('restaurants')
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
      .limit(10)
      .explain('executionStats');
    
    console.log(`   Documents examined: ${explainGeo.executionStats.totalDocsExamined}`);
    console.log(`   Documents returned: ${explainGeo.executionStats.nReturned}`);
    console.log(`   Execution time: ${explainGeo.executionStats.executionTimeMillis}ms`);
    
    console.log('\n Query analysis completed!\n');
    
    await database.disconnect();
  } catch (error) {
    console.error(' Analysis error:', error);
    await database.disconnect();
  }
}

analyzeQueryPerformance();