// src/controllers/commentController.js
const { ObjectId } = require('mongodb');
const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get all comments for a restaurant
 * @route GET /api/v1/restaurants/:restaurantId/comments
 */
exports.getCommentsByRestaurant = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    // Verify restaurant exists
    const restaurant = await db.collection('restaurants')
      .findOne({ _id: new ObjectId(restaurantId) });
    
    if (!restaurant) {
      return next(new AppError('Restaurant not found', 404));
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const comments = await db.collection('comments')
      .find({ restaurantId: new ObjectId(restaurantId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await db.collection('comments')
      .countDocuments({ restaurantId: new ObjectId(restaurantId) });
    
    res.status(200).json({
      status: 'success',
      results: comments.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: {
        comments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single comment by ID
 * @route GET /api/v1/restaurants/:restaurantId/comments/:commentId
 */
exports.getCommentById = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId, commentId } = req.params;
    
    const comment = await db.collection('comments')
      .findOne({ 
        _id: new ObjectId(commentId),
        restaurantId: new ObjectId(restaurantId)
      });
    
    if (!comment) {
      return next(new AppError('Comment not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        comment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new comment
 * @route POST /api/v1/restaurants/:restaurantId/comments
 */
exports.createComment = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId } = req.params;
    const { userId, username, comment } = req.body;
    
    // Verify restaurant exists
    const restaurant = await db.collection('restaurants')
      .findOne({ _id: new ObjectId(restaurantId) });
    
    if (!restaurant) {
      return next(new AppError('Restaurant not found', 404));
    }
    
    // Create new comment
    const newComment = {
      restaurantId: new ObjectId(restaurantId),
      userId: userId,
      username: username,
      comment: comment,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('comments').insertOne(newComment);
    
    const createdComment = await db.collection('comments')
      .findOne({ _id: result.insertedId });
    
    res.status(201).json({
      status: 'success',
      data: {
        comment: createdComment
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update comment
 * @route PUT /api/v1/restaurants/:restaurantId/comments/:commentId
 */
exports.updateComment = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId, commentId } = req.params;
    const { comment } = req.body;
    
    const result = await db.collection('comments').findOneAndUpdate(
      { 
        _id: new ObjectId(commentId),
        restaurantId: new ObjectId(restaurantId)
      },
      { 
        $set: { 
          comment: comment,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return next(new AppError('Comment not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        comment: result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comment
 * @route DELETE /api/v1/restaurants/:restaurantId/comments/:commentId
 */
exports.deleteComment = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { restaurantId, commentId } = req.params;
    
    const result = await db.collection('comments').deleteOne({
      _id: new ObjectId(commentId),
      restaurantId: new ObjectId(restaurantId)
    });
    
    if (result.deletedCount === 0) {
      return next(new AppError('Comment not found', 404));
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

/*module.exports = {
  getCommentsByRestaurant,
  getCommentById,
  createComment,
  updateComment,
  deleteComment
};*/