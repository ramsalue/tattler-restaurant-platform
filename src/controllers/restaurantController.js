// src/controllers/restaurantController.js

// Import necessary modules from the mongodb driver,  database config, and error handler.
const { ObjectId, Double, Int32 } = require('mongodb');
const database = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc    Get all restaurants with filtering, sorting, and pagination
 * @route   GET /api/v1/restaurants
 * @access  Public
 */
const getAllRestaurants = async (req, res, next) => {
  try {
    // Get the database instance from our singleton.
    const db = database.getDb();

    // Build a filter object based on the query parameters using a helper function.
    const filter = buildFilterQuery(req.query);
    // Build a sort object based on the query parameters.
    const sort = buildSortCriteria(req.query.sortBy, req.query.order);

    console.log('DEBUG: Generated Filter Object:', filter); // <-- ADD THIS LINE

    // Handle pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const restaurants = await db.collection('restaurants').find(filter).sort(sort).skip(skip).limit(limit).toArray();

    const total = await db.collection('restaurants').countDocuments(filter);

    // Prepare response object with metadata.
    const response = {
      status: 'success',
      results: restaurants.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: req.query, // Echo back the filters used
      sort: { field: req.query.sortBy || 'rating', order: req.query.order || 'desc' },
      data: { restaurants }
    };

    res.status(200).json(response);
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
const getRestaurantById = async (req, res, next) => {
  try {
    const db = database.getDb();
    // Get the 'id' from the URL parameters (/restaurants/some-id-value).
    const { id } = req.params;

    // Find one document where the '_id' field matches the provided ID.
    // Must convert the string 'id' from the URL into a MongoDB ObjectId.
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
const createRestaurant = async (req, res, next) => {
  try {
    const db = database.getDb();

    // Construct a new restaurant document from the request body (req.body).
    // It's been uses || '' to provide default empty values and ensure correct BSON types.
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
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the new document into the database.
    const result = await db.collection('restaurants').insertOne(newRestaurant);

    // Fetch the newly created document using the ID returned from the insert operation.
    const restaurant = await db.collection('restaurants').findOne({ _id: result.insertedId });

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
const updateRestaurant = async (req, res, next) => {
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
const deleteRestaurant = async (req, res, next) => {
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

/**
 * @desc search restaurants using a text index
 * @route GET /api/v1/restaurants/search
 * @access Public
 */
const searchRestaurants = async(req, res, next) => {
  try{
    const db = database.getDb();
    // Get the search term from the query string (supports both 'q' and 'query')
    const{q, query, limit = 20, page=1, sortBy = "score", order = 'desc'} = req.query;
    const searchTerm = q || query; 

    // Return an error if th search is empty
    if(!searchTerm || searchTerm.trim() === ''){
      return next(new AppError('Search query is required', 400));
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // This is the core MongoDB text search query.
    // It uses the text index that was created in Sprint 1.
    const searchQuery = { $text: { $search: searchTerm } };

    // The variable 'projection' tells MongoDB to include a special 'score' field
    // that represents how relevant the result is to the search term.
    const projection = {score: {$meta: "textScore"}};

    // By default, it's sort by the relevance score
    let sortCriteria = {score: {$meta: "textScore"}};
    if (sortBy === 'rating'){
      sortCriteria = {rating: order === 'asc' ? 1: -1};
    }else if (sortBy === 'name'){
      sortCriteria = {name: order === 'asc' ? 1 : -1};
    }

    const restaurants = await db.collection('restaurants').find(searchQuery, {projection})
    .sort(sortCriteria).skip(skip).limit(parseInt(limit)).toArray();

    const total = await db.collection('restaurants').countDocuments(searchQuery);

    res.status(200).json({
      status: 'success',
      results: restaurants.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      searchTerm,
      data: { restaurants }
    })
  } catch (error){
    next(error);
  }
}

/**
 * @desc    Get nearby restaurants using a geospatial query
 * @route   GET /api/v1/restaurants/nearby
 * @access  Public
 */
const getNearbyRestaurants = async (req, res, next) => {
  try {
    const db = database.getDb();
    // Get coordinates and radius from the query string.
    const { latitude, longitude, radius = 5, limit = 20 } = req.query; // Default radius to 5 km.

    // Basic validation for required parameters.
    if (!latitude || !longitude) {
      return next(new AppError('Latitude and longitude are required query parameters', 400));
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // This is the core MongoDB geospatial query.
    const query = {
      'location.coordinates': {
        // $near finds documents near a specified point.
        $near: {
          // $geometry specifies the point in GeoJSON format.
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]  // IMPORTANT: GeoJSON is always [longitude, latitude]
          },
          // $maxDistance specifies the search radius in meters.
          $maxDistance: parseFloat(radius) * 1000  // Convert radius from km to meters.
        }
      }
    };

    const restaurants = await db.collection('restaurants')
      .find(query)
      .limit(parseInt(limit))
      .toArray();

    // The $near operator sorts the results by distance, but doesn't include the distance
    // in the result. It is calculated for a more user-friendly.
    const restaurantsWithDistance = restaurants.map(restaurant => {
      const distance = calculateDistance(
        lat, lng,
        restaurant.location.coordinates.coordinates[1],  // restaurant's latitude
        restaurant.location.coordinates.coordinates[0]   // restaurant's longitude
      );

      return {
        ...restaurant,
        distance: Math.round(distance * 100) / 100  // Round to 2 decimal places in km.
      };
    });

    res.status(200).json({
      status: 'success',
      results: restaurantsWithDistance.length,
      searchCenter: {
        latitude: lat,
        longitude: lng
      },
  radius: parseFloat(radius),
      data: {
        restaurants: restaurantsWithDistance
      }
    });
  } catch (error) {
    next(error);
  }
};


// Add this to src/controllers/restaurantController.js

/**
 * @desc    Get aggregated statistics about restaurants
 * @route   GET /api/v1/restaurants/stats
 * @access  Public
 */
const getRestaurantStats = async (req, res, next) => {
  try {
    const db = database.getDb();

    // This is a MongoDB Aggregation Pipeline. It processes data in stages
    // to return computed results.
    const stats = await db.collection('restaurants').aggregate([
      {
        // The $facet stage allows to run multiple aggregation pipelines
        // within a single stage on the same set of input documents.
        $facet: {
          // Pipeline 1: Group by cuisine and count.
          byCuisine: [
            { $group: { _id: '$cuisine', count: { $sum: 1 } } },
            { $sort: { count: -1 } } // Sort by most common cuisine.
          ],

          // Pipeline 2: Group by price range and count.
          byPriceRange: [
            { $group: { _id: '$priceRange', count: { $sum: 1 } } },
            { $sort: { _id: 1 } } // Sort by price range ($, $$, etc.).
          ],

          // Pipeline 3: Group by city and count.
          byCity: [
            { $group: { _id: '$location.city', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],

          // Pipeline 4: Calculate overall rating statistics.
          ratingStats: [
            {
              $group: {
                _id: null, // Group all documents into one.
                avgRating: { $avg: '$rating' },
                minRating: { $min: '$rating' },
                maxRating: { $max: '$rating' },
                totalRestaurants: { $sum: 1 }
              }
            }
          ],

          // Pipeline 5: Find the top 5 highest-rated restaurants.
          topRated: [
            { $sort: { rating: -1 } },
            { $limit: 5 },
            // $project specifies which fields to include in the output.
            { $project: { name: 1, cuisine: 1, rating: 1 } }
          ]
        }
      }
    ]).toArray();

    res.status(200).json({
      status: 'success',
      data: {
        // The result of a $facet pipeline is an array with a single document.
        statistics: stats[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to calculate the distance between two coordinates in kilometers
 * using the Haversine formula.
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value) {
  return value * Math.PI / 180;
}

/**
 * Helper function to build a MongoDB filter query object from URL query parameters.
 * It's used for getAllRestaurants
 */
function buildFilterQuery(params) {
  const filter = {};

  if (params.cuisine) filter.cuisine = params.cuisine;
  if (params.city) filter['location.city'] = params.city;

  // Handle multiple price ranges (?priceRange=$$,$$$)
  if (params.priceRange) {
    const priceRanges = params.priceRange.split(',').map(p => p.trim());
    // If there's only one, it's a simple match. If multiple, use the '$in' operator.
    filter.priceRange = priceRanges.length === 1 ? priceRanges[0] : { $in: priceRanges };
  }

  // Handle rating ranges (minRating=3&maxRating=4.5)
  const ratingFilter = {};
  if (params.minRating) ratingFilter.$gte = parseFloat(params.minRating); // $gte = greater than or equal to
  if (params.maxRating) ratingFilter.$lte = parseFloat(params.maxRating); // $lte = less than or equal to
  if (Object.keys(ratingFilter).length > 0) filter.rating = ratingFilter;

  // Handle amenities (amenities=WiFi,Parking) - must have ALL specified.
  if (params.amenities) {
    const amenitiesList = params.amenities.split(',').map(a => a.trim());
    filter.amenities = { $all: amenitiesList };
  }

  return filter;
}

/**
 * Helper function to build a MongoDB sort object.
 */
function buildSortCriteria(sortBy, order) {
  const sortOrder = order === 'asc' ? 1 : -1;

  // A switch statement to handle different sort fields.
  switch (sortBy) {
    case 'name':
      return { name: sortOrder };
    case 'totalRatings':
      return { totalRatings: sortOrder };
    case 'priceRange':
      return { priceRange: sortOrder };
    case 'rating':
    default: // Default sort is by rating, descending.
      return { rating: -1 };
  }
}

// src/controllers/restaurantController.js
// These part of the code is causing some troubles***
module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurants,
  getNearbyRestaurants,
  getRestaurantStats 
};