// src/middleware/validators.js
const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');
const { ObjectId } = require('mongodb');
/**
 * A general middleware that checks for validation errors from express-validator.
 * If errors exist, it sends a 400 response. Otherwise, it continues.
 * Validate Request
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'fail',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validate MongoDB ObjectId
 */
const validateObjectId = (paramName = 'id') => {
  return param(paramName)
    .custom((value) => {
      if (!ObjectId.isValid(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    });
};

/**
 * Restaurant Validation Rules
 */
const restaurantValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Restaurant name is required')
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('cuisine')
      .trim()
      .notEmpty().withMessage('Cuisine type is required'),
    
    body('location.address')
      .trim()
      .notEmpty().withMessage('Address is required'),
    
    body('location.city')
      .trim()
      .notEmpty().withMessage('City is required'),
    
    body('location.coordinates.latitude')
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    
    body('location.coordinates.longitude')
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    
    body('priceRange')
      .optional()
      .isIn(['$', '$$', '$$$', '$$$$']).withMessage('Price range must be $, $$, $$$, or $$$$'),
    
    body('phone')
      .optional()
      .trim(),
    
    body('website')
      .optional()
      .trim()
      .isURL().withMessage('Must be a valid URL'),
    
    validate
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
    body('cuisine')
      .optional()
      .trim(),
    
    body('priceRange')
      .optional()
      .isIn(['$', '$$', '$$$', '$$$$']).withMessage('Price range must be $, $$, $$$, or $$$$'),
    
    validate
  ]
};

/**
 * Rating Validation Rules
 */
const ratingValidation = {
  create: [
    validateObjectId('restaurantId'),
    
    body('userId')
      .trim()
      .notEmpty().withMessage('User ID is required'),
    
    body('rating')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    
    body('review')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Review must be less than 500 characters'),
    
    validate
  ]
};

/**
 * Comment Validation Rules
 */
const commentValidation = {
  create: [
    validateObjectId('restaurantId'),
    
    body('userId')
      .trim()
      .notEmpty().withMessage('User ID is required'),
    
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required'),
    
    body('comment')
      .trim()
      .notEmpty().withMessage('Comment text is required')
      .isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
    
    validate
  ],

  update: [
    validateObjectId('restaurantId'),
    validateObjectId('commentId'),
    
    body('comment')
      .trim()
      .notEmpty().withMessage('Comment text is required')
      .isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters'),
    
    validate
  ]
};

/**
 * Search and Filter Validation Rules
 */
const searchValidation = {
  query: [
    query('query')
      .optional()
      .trim(),
    
    query('cuisine')
      .optional()
      .trim(),
    
    query('city')
      .optional()
      .trim(),
    
    query('priceRange')
      .optional()
      .isIn(['$', '$$', '$$$', '$$$$']).withMessage('Invalid price range'),
    
    query('minRating')
      .optional()
      .isFloat({ min: 0, max: 5 }).withMessage('Minimum rating must be between 0 and 5'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
    validate
  ]
};

module.exports = {
  validate,
  validateObjectId,
  restaurantValidation,
  ratingValidation,
  commentValidation,
  searchValidation
};