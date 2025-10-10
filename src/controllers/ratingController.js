// src/controllers/ratingController.js
const { ObjectId, Double, Int32 } = require('mongodb');
const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all ratings for a restaurant
 * @route GET /api/v1/restaurants/:restaurantId/ratings
 */
exports.getRatingsByRestaurant = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId } = req.params;
    
    // Verify restaurant exists
    const restaurant = await db.collection('restaurants')
      .findOne({ _id: new ObjectId(restaurantId) });
    
    if (!restaurant) {
      return next(new AppError('Restaurant not found', 404));
    }
    
    const ratings = await db.collection('ratings')
      .find({ restaurantId: new ObjectId(restaurantId) })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.status(200).json({
      status: 'success',
      results: ratings.length,
      data: {
        ratings
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single rating by ID
 * @route GET /api/v1/restaurants/:restaurantId/ratings/:ratingId
 */
exports.getRatingById = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId, ratingId } = req.params;
    
    const rating = await db.collection('ratings')
      .findOne({ 
        _id: new ObjectId(ratingId),
        restaurantId: new ObjectId(restaurantId)
      });
    
    if (!rating) {
      return next(new AppError('Rating not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        rating
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new rating
 * @route POST /api/v1/restaurants/:restaurantId/ratings
 */
exports.createRating = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId } = req.params;
    const { userId, rating, review } = req.body;
    
    // Verify restaurant exists
    const restaurant = await db.collection('restaurants')
      .findOne({ _id: new ObjectId(restaurantId) });
    
    if (!restaurant) {
      return next(new AppError('Restaurant not found', 404));
    }
    
    // Check if user already rated this restaurant
    const existingRating = await db.collection('ratings')
      .findOne({ 
        restaurantId: new ObjectId(restaurantId),
        userId: userId
      });
    
    if (existingRating) {
      return next(new AppError('You have already rated this restaurant. Use PUT to update your rating.', 400));
    }
    
    // Create new rating
    const newRating = {
      restaurantId: new ObjectId(restaurantId),
      userId: userId,
      rating: new Int32(parseInt(rating)),
      review: review || '',
      createdAt: new Date()
    };
    
    const result = await db.collection('ratings').insertOne(newRating);
    
    // Update restaurant's average rating and total ratings
    await updateRestaurantRating(db, restaurantId);
    
    const createdRating = await db.collection('ratings')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json({
      status: 'success',
      data: {
        rating: createdRating
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update rating
 * @route PUT /api/v1/restaurants/:restaurantId/ratings/:ratingId
 */
exports.updateRating = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId, ratingId } = req.params;
    const { rating, review } = req.body;
    
    const updateFields = {};
    if (rating !== undefined) updateFields.rating = new Int32(parseInt(rating));
    if (review !== undefined) updateFields.review = review;
    updateFields.updatedAt = new Date();
    
    const result = await db.collection('ratings').findOneAndUpdate(
      { 
        _id: new ObjectId(ratingId),
        restaurantId: new ObjectId(restaurantId)
      },
      { $set: updateFields },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return next(new AppError('Rating not found', 404));
    }
    
    // Update restaurant's average rating
    await updateRestaurantRating(db, restaurantId);
    
    res.status(200).json({
      status: 'success',
      data: {
        rating: result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete rating
 * @route DELETE /api/v1/restaurants/:restaurantId/ratings/:ratingId
 */
exports.deleteRating = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId, ratingId } = req.params;
    
    const result = await db.collection('ratings').deleteOne({
      _id: new ObjectId(ratingId),
      restaurantId: new ObjectId(restaurantId)
    });
    
    if (result.deletedCount === 0) {
      return next(new AppError('Rating not found', 404));
    }
    
    // Update restaurant's average rating
    await updateRestaurantRating(db, restaurantId);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update restaurant's average rating
 */
async function updateRestaurantRating(db, restaurantId) {
  const ratings = await db.collection('ratings')
    .find({ restaurantId: new ObjectId(restaurantId) })
    .toArray();
  
  if (ratings.length === 0) {
    await db.collection('restaurants').updateOne(
      { _id: new ObjectId(restaurantId) },
      { 
        $set: { 
          rating: new Double(0.0),
          totalRatings: new Int32(0)
        }
      }
    );
  } else {
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;
    
    await db.collection('restaurants').updateOne(
      { _id: new ObjectId(restaurantId) },
      { 
        $set: { 
          rating: new Double(averageRating),
          totalRatings: new Int32(ratings.length)
        }
      }
    );
  }
}

/*module.exports = {
  getRatingsByRestaurant,
  getRatingById,
  createRating,
  updateRating,
  deleteRating
};*/