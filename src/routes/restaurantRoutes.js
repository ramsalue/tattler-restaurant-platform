// src/routes/restaurantRoutes.js
const express = require('express');
// Import the controller functions
const restaurantController = require('../controllers/restaurantController');
// Import the validation middleware
const { restaurantValidation, validateObjectId, searchValidation, geoSearchValidation } = require('../middleware/validators');
const { cacheMiddleware, clearCacheOnModify } = require('../middleware/cache');


// Import the nested routes 
const ratingRoutes = require('./ratingRoutes');
const commentRoutes = require('./commentRoutes');

// Create a new router object. This works like a mini-app, and it can define all the restaurant-related routes on it.
const router = express.Router();

// Apply cache clearing middleware to all routes in this file
router.use(clearCacheOnModify);

// --- Mount the rating router ---
// This tells Express: "For any request that matches '/:restaurantId/ratings',
// hand over control to the ratingRoutes router".
router.use('/:restaurantId/ratings', ratingRoutes);
router.use('/:restaurantId/comments', commentRoutes); 

/**
 * @route   GET /api/v1/restaurants/stats
 * @desc    Get restaurant statistics
 * @access  Public
 */
router.get('/stats',cacheMiddleware, restaurantController.getRestaurantStats);

/**
 * @route   GET /api/v1/restaurants/nearby
 * @desc    Get nearby restaurants using geospatial search
 * @access  Public
 */
router.get('/nearby',cacheMiddleware, geoSearchValidation.nearby, restaurantController.getNearbyRestaurants);

/**
 * @route   GET /api/v1/restaurants/search
 * @desc    Search restaurants by text query
 * @access  Public
 * NEW ROUTE
 * This route is specifically for text searches.
 */
router.get('/search',cacheMiddleware, searchValidation.query, restaurantController.searchRestaurants);


/**
 * @route   GET /api/v1/restaurants
 * @desc    Get all restaurants with pagination.
 * @access  Public
 */
// When a GET request is made to '/', run the getAllRestaurants controller function.
router.get('/',cacheMiddleware,searchValidation.query, restaurantController.getAllRestaurants);

/**
 * @route   GET /api/v1/restaurants
 * @desc    Get all restaurants with filtering, sorting, and pagination
 * @access  Public
 * --- UPDATED ROUTE ---
 * It was added the searchValidation.query middleware to validate the new filter parameters.
 */
router.get('/',cacheMiddleware, searchValidation.query, restaurantController.getAllRestaurants);

/**
 * @route   GET /api/v1/restaurants/:id
 * @desc    Get a single restaurant by its ID.
 * @access  Public
 */
router.get('/:id',cacheMiddleware, validateObjectId('id'), restaurantController.getRestaurantById);

/**
 * @route   POST /api/v1/restaurants
 * @desc    Create a new restaurant.
 * @access  Public (should be protected in a real app)
 */
// When a POST request is made to '/', first run the 'create' validation rules,
// and if the data is valid, then run the createRestaurant controller function.
router.post('/', restaurantValidation.create, restaurantController.createRestaurant);

/**
 * @route   PUT /api/v1/restaurants/:id
 * @desc    Update an existing restaurant.
 * @access  Public (should be protected in a real app)
 */
// For a PUT request to '/:id', two sets of middleware are run: one to validate
// the ID format, and another to validate the incoming update data, before
// finally running the updateRestaurant controller function.
router.put('/:id', validateObjectId('id'), restaurantValidation.update, restaurantController.updateRestaurant);

/**
 * @route   DELETE /api/v1/restaurants/:id
 * @desc    Delete a restaurant.
 * @access  Public (should be protected in a real app)
 */
router.delete('/:id', validateObjectId('id'), restaurantController.deleteRestaurant);

// Export the router so it cab be used in the main server file.
module.exports = router;