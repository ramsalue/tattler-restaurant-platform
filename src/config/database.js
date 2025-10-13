// src/config/database.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

// This class will manage the database connection.
class Database {
  constructor() {
    // These will hold the connection client and db object once connected.
    this.client = null;
    this.db = null;
  }

  // Asynchronous method to connect to the database.
  async connect() {
    try {
      // If it's already connected, don't create a new connection.
      if (this.client) {
        console.log(' Database already connected');
        return this.db;
      }

      // Get the connection string from the .env file.
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MONGODB_URI is not defined in environment variables');
      }

      // Create a new MongoClient with some performance options (connection pooling).
      this.client = new MongoClient(uri, {
        maxPoolSize: 10, // Max 10 concurrent connections
        minPoolSize: 5,  // Maintain at least 5 open connections
        maxIdleTimeMS: 30000, // Close connections if idle for 30 seconds
      });

      // Await the connection and store the client and db objects.
      await this.client.connect();
      this.db = this.client.db(process.env.DB_NAME);
      
      console.log('Connected to MongoDB Atlas');
      return this.db;
    } catch (error) {
      console.error(' MongoDB connection error:', error.message);
      throw error;
    }
  }

  // Method to close the database connection.
  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log(' MongoDB connection closed');
      }
    } catch (error) {
      console.error(' Error closing MongoDB connection:', error.message);
      throw error;
    }
  }

  // A "getter" method to retrieve the database object from anywhere in our app.
  getDb() {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }
}

// This is the "Singleton" pattern. It create ONE instance of the Database class
// and export it. This ensures the entire application shares the same single instance.
const database = new Database();
module.exports = database;