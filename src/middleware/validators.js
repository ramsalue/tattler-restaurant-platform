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
 * This object contains an array of validation rules for all the new query parameters.
 */
const searchValidation = {
  query: [
    // Rules for the text search term ('q' or 'query')
    query('q').optional().trim().isLength({ min: 1 }),
    query('query').optional().trim().isLength({ min: 1 }),

    // Rules for the filter parameters
    query('cuisine').optional().trim(),
    query('city').optional().trim(),

    // Use a regular expression to validate the priceRange format ("$$" or "$$,$$$")
    query('priceRange').optional().trim().matches(/^(\$|\$\$|\$\$\$|\$\$\$\$)(,(\$|\$\$|\$\$\$|\$\$\$\$))*$/)
      .withMessage('Invalid priceRange format. Use $, $$, etc., comma-separated for multiple.'),

    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('maxRating').optional().isFloat({ min: 0, max: 5 }),

    // Rules for sorting parameters
    query('sortBy').optional().isIn(['name', 'rating', 'totalRatings', 'priceRange', 'score'])
      .withMessage('Invalid sortBy value.'),

    query('order').optional().isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc.'),

    // Rule for pagination
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('page').optional().isInt({ min: 1 }),

    // A custom validator to ensure minRating is not greater than maxRating
    query('minRating').custom((value, { req }) => {
        if (value && req.query.maxRating && (parseFloat(value) > parseFloat(req.query.maxRating))) {
            throw new Error('minRating cannot be greater than maxRating');
        }
        return true;
    }),

    validate // This runs all the checks
  ]
};

/**
 * Geospatial Search Validation Rules
 */
const geoSearchValidation = {
  nearby: [
    // Rule: latitude is required and must be a valid float.
    query('latitude')
      .notEmpty().withMessage('Latitude is required')
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

    // Rule: longitude is required and must be a valid float.
    query('longitude')
      .notEmpty().withMessage('Longitude is required')
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

    // Rule: radius is optional but if present, must be a float in a reasonable range.
    query('radius')
      .optional()
      .isFloat({ min: 0.1, max: 100 }).withMessage('Radius must be between 0.1 and 100 km'),

    // Re-use existing validation rules for limit, minRating, etc.
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('minRating').optional().isFloat({ min: 0, max: 5 }),
    query('cuisine').optional().trim(),

    validate // Run all the checks.
  ]
};

module.exports = {
  validate,
  validateObjectId,
  restaurantValidation,
  ratingValidation,
  commentValidation,
  searchValidation,
  geoSearchValidation
};