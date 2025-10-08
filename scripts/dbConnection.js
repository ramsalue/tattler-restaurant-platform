// scripts/dbConnection.js
// This script is never run directly from the command line
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    return client.db(process.env.DB_NAME);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function closeDB() {
  await client.close();
  console.log('MongoDB connection closed');
}

module.exports = { connectDB, closeDB };