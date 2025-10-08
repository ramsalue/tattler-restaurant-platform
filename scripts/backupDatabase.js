// scripts/backupDatabase.js
const { connectDB, closeDB } = require('./dbConnection');
const fs = require('fs');
const path = require('path');

async function backupDatabase() {
  const db = await connectDB();

  try {
    const collections = ['restaurants', 'users', 'ratings', 'comments'];
    const backup = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: process.env.DB_NAME,
      collections: {}
    };

    for (const collectionName of collections) {
      const data = await db.collection(collectionName).find({}).toArray();
      backup.collections[collectionName] = data;
      console.log(`✅ Backed up ${collectionName}: ${data.length} documents`);
    }

    // Save backup to file
    const backupPath = path.join(__dirname, '../data/backup/tattler_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`\n💾 Backup saved to: ${backupPath}`);

    // Also create a indexes backup
    const indexesBackup = {};
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      indexesBackup[collectionName] = indexes;
    }

    const indexesPath = path.join(__dirname, '../data/backup/indexes_backup.json');
    fs.writeFileSync(indexesPath, JSON.stringify(indexesBackup, null, 2));
    console.log(`📑 Indexes backup saved to: ${indexesPath}`);

  } catch (error) {
    console.error('❌ Backup error:', error);
  } finally {
    await closeDB();
  }
}

backupDatabase();