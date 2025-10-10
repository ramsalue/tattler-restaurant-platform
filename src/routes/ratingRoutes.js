// src/routes/ratingRoutes.js
const express = require('express');
const ratingController = require('../controllers/ratingController');
const { ratingValidation, validateObjectId } = require('../middleware/validators');

// ** VERY IMPORTANT **
// The { mergeParams: true } option is essential for nested routes.
// It allows this router to access parameters from the parent router,
// in this case, :restaurantId from the restaurant router.
const router = express.Router({ mergeParams: true });

// Define the routes for this router.
// Note that the paths are relative to where this router is mounted.
// For example, '/' here will correspond to '/api/v1/restaurants/:restaurantId/ratings'.
router.route('/')
  .get(ratingController.getRatingsByRestaurant)
  .post(ratingValidation.create, ratingController.createRating);

router.route('/:ratingId')
  .get(validateObjectId('ratingId'), ratingController.getRatingById)
  .put(validateObjectId('ratingId'), ratingController.updateRating)
  .delete(validateObjectId('ratingId'), ratingController.deleteRating);

module.exports = router;