// src/server.js

// --- 1. IMPORTS ---
// Import core packages
const express = require('express');
const helmet = require('helmet'); // For security headers
const cors = require('cors');     // To allow cross-origin requests
const bodyParser = require('body-parser'); // To parse incoming request bodies
require('dotenv').config(); // To load environment variables

// Import the custom modules
const database = require('./config/database');
const logger = require('./middleware/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const performanceMonitor = require('./middleware/performance');

// Import the route files
const restaurantRoutes = require('./routes/restaurantRoutes');

// --- 2. INITIALIZE EXPRESS APP ---
const app = express();

// --- 3. MIDDLEWARE SETUP ---
// Apply security headers
app.use(helmet());

// Configure CORS (Cross-Origin Resource Sharing)
const corsOptions = {
  // Allow requests only from the origins specified in the .env file
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Configure body-parser to parse JSON and URL-encoded data from requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use the custom logger middleware for all incoming requests
app.use(logger);
//app.use(performanceMonitor); // To review the performance of the process

// --- 4. API ROUTES ---
// A simple health check route to confirm the API is running
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Tattler API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1'
  });
});

// Register restaurant routes. All routes defined in restaurantRoutes.js
// will now be available under the '/api/v1/restaurants' prefix.
app.use(`/api/${process.env.API_VERSION}/restaurants`, restaurantRoutes);

// A simple welcome route for the root URL
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to Tattler Restaurant API' });
});

// --- 5. ERROR HANDLING MIDDLEWARE ---
// These must be the LAST middleware registered.
// Handle 404 Not Found errors for any routes that don't exist
app.use(notFound);
// Use the global error handler to catch and format all errors
app.use(errorHandler);

// --- 6. START THE SERVER ---
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

async function startServer() {
  try {
    // Connect to the database
    await database.connect();

    // Start the Express server and listen for requests on the specified port
    app.listen(PORT, () => {
      console.log(` Server running on http://${HOST}:${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV}`);
      console.log(`\n Tattler API is ready to accept requests!`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error.message);
    process.exit(1);
  }
}

// Call the function to start the server.
startServer();

module.exports = app;