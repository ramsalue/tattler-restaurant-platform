// src/routes/restaurantRoutes.js
const express = require('express');
// Import the controller functions
const restaurantController = require('../controllers/restaurantController');
// Import the validation middleware created in Phase 3.
const { restaurantValidation, validateObjectId } = require('../middleware/validators');

// --- NEW: Import the rating router ---
const ratingRoutes = require('./ratingRoutes');
const commentRoutes = require('./commentRoutes');

// Create a new router object. This works like a mini-app,
// and it can define all our restaurant-related routes on it.
const router = express.Router();

// --- NEW: Mount the rating router ---
// This tells Express: "For any request that matches '/:restaurantId/ratings',
// hand over control to the ratingRoutes router".
router.use('/:restaurantId/ratings', ratingRoutes);
router.use('/:restaurantId/comments', commentRoutes); 

/**
 * @route   GET /api/v1/restaurants
 * @desc    Get all restaurants with pagination.
 * @access  Public
 */
// When a GET request is made to '/', run the getAllRestaurants controller function.
router.get('/', restaurantController.getAllRestaurants);

/**
 * @route   GET /api/v1/restaurants/:id
 * @desc    Get a single restaurant by its ID.
 * @access  Public
 */
// When a GET request is made to '/:id', FIRST run the validateObjectId middleware,
// and if it passes, THEN run the getRestaurantById controller function.
router.get('/:id', validateObjectId('id'), restaurantController.getRestaurantById);

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
// For a PUT request to '/:id', we run two sets of middleware: one to validate
// the ID format, and another to validate the incoming update data, before
// finally running the updateRestaurant controller function.
router.put('/:id', validateObjectId('id'), restaurantValidation.update, restaurantController.updateRestaurant);

/**
 * @route   DELETE /api/v1/restaurants/:id
 * @desc    Delete a restaurant.
 * @access  Public (should be protected in a real app)
 */
router.delete('/:id', validateObjectId('id'), restaurantController.deleteRestaurant);

// Export the router so we can use it in our main server file.
module.exports = router;