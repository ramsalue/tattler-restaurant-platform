// src/controllers/restaurantController.js

// Import necessary modules from the mongodb driver, our database config, and error handler.
const { ObjectId, Double, Int32 } = require('mongodb');
const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get all restaurants with pagination
 * @route   GET /api/v1/restaurants
 * @access  Public
 */
exports.getAllRestaurants = async (req, res, next) => {
  try {
    // Get the database instance from our singleton.
    const db = database.getDb();

    // Get pagination parameters from the query string (e.g., ?limit=10&page=2)
    // with default values if they are not provided.
    const { limit = 20, page = 1 } = req.query;

    // Calculate the number of documents to skip for pagination.
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Query the database for restaurants, applying skip and limit for pagination.
    const restaurants = await db.collection('restaurants')
      .find({}) // An empty {} in find() means "match all documents".
      .skip(skip)
      .limit(parseInt(limit))
      .toArray(); // Convert the result cursor to an array.

    // Get the total count of all documents for pagination metadata.
    const total = await db.collection('restaurants').countDocuments();

    // Send a successful JSON response.
    res.status(200).json({
      status: 'success',
      results: restaurants.length, // Number of results on the current page.
      total, // Total number of restaurants in the database.
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)), // Calculate total pages.
      data: {
        restaurants
      }
    });
  } catch (error) {
    // If any error occurs, pass it to the global error handler.
    next(error);
  }
};

/**
 * @desc    Get a single restaurant by its ID
 * @route   GET /api/v1/restaurants/:id
 * @access  Public
 */
exports.getRestaurantById = async (req, res, next) => {
  try {
    const db = database.getDb();
    // Get the 'id' from the URL parameters (e.g., /restaurants/some-id-value).
    const { id } = req.params;

    // Find one document where the '_id' field matches the provided ID.
    // We must convert the string 'id' from the URL into a MongoDB ObjectId.
    const restaurant = await db.collection('restaurants')
      .findOne({ _id: new ObjectId(id) });

    // If no restaurant is found, create a 404 error and pass it to the error handler.
    if (!restaurant) {
      return next(new AppError('Restaurant not found with that ID', 404));
    }

    // Send a successful response with the found restaurant.
    res.status(200).json({
      status: 'success',
      data: {
        restaurant
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new restaurant
 * @route   POST /api/v1/restaurants
 * @access  Public (for now)
 */
exports.createRestaurant = async (req, res, next) => {
  try {
    const db = database.getDb();

    // Construct a new restaurant document from the request body (req.body).
    // We use || '' to provide default empty values and ensure correct BSON types.
    const newRestaurant = {
      name: req.body.name,
      cuisine: req.body.cuisine,
      location: {
        address: req.body.location.address,
        city: req.body.location.city,
        state: req.body.location.state || '',
        zipCode: req.body.location.zipCode || '',
        coordinates: {
          latitude: new Double(parseFloat(req.body.location.coordinates.latitude)),
          longitude: new Double(parseFloat(req.body.location.coordinates.longitude))
        }
      },
      priceRange: req.body.priceRange || '$$',
      rating: new Double(0.0), // Initialize with a default rating.
      totalRatings: new Int32(0), // Initialize with zero ratings.
      // ... (other fields with defaults)
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the new document into the database.
    const result = await db.collection('restaurants').insertOne(newRestaurant);

    // Fetch the newly created document using the ID returned from the insert operation.
    const restaurant = await db.collection('restaurants')
      .findOne({ _id: result.insertedId });

    // Send a 201 "Created" response with the new restaurant data.
    res.status(201).json({
      status: 'success',
      data: {
        restaurant
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing restaurant
 * @route   PUT /api/v1/restaurants/:id
 * @access  Public (for now)
 */
exports.updateRestaurant = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { id } = req.params;

    // Build an object containing only the fields that were provided in the request body.
    const updateFields = { ...req.body };
    updateFields.updatedAt = new Date(); // Always update the 'updatedAt' timestamp.

    // Find the document by ID and update it with the new fields.
    // '$set' tells MongoDB to update only the specified fields.
    // 'returnDocument: 'after'' ensures the method returns the updated document.
    const result = await db.collection('restaurants').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return next(new AppError('Restaurant not found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        restaurant: result
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a restaurant
 * @route   DELETE /api/v1/restaurants/:id
 * @access  Public (for now)
 */
exports.deleteRestaurant = async (req, res, next) => {
  try {
    const db = database.getDb();
    const { id } = req.params;

    // Find and delete the document by its ID.
    const result = await db.collection('restaurants').deleteOne({
      _id: new ObjectId(id)
    });

    // If no document was deleted, it means it wasn't found.
    if (result.deletedCount === 0) {
      return next(new AppError('Restaurant not found with that ID', 404));
    }

    // As a cleanup step, also delete any ratings and comments associated with this restaurant.
    await db.collection('ratings').deleteMany({ restaurantId: new ObjectId(id) });
    await db.collection('comments').deleteMany({ restaurantId: new ObjectId(id) });

    // Send a 204 "No Content" response, which is standard for a successful deletion.
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};