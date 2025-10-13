# Tattler Restaurant Platform

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Express](https://img.shields.io/badge/Express.js-4.18-lightgrey)
![Node.js](https://img.shields.io/badge/Node.js-18+-brightgreen)
![License](https://img.shields.io/badge/license-MIT-yellow)

##  Project Description

Tattler is a modern restaurant directory platform with an advanced RESTful API built using Express.js and MongoDB. The platform enables users to discover restaurants through powerful search and filtering capabilities, view ratings and comments, and find nearby dining options using geospatial queries.

---

##  Features

### Sprint 1 (Completed) 
- MongoDB Atlas database configuration
- Database schema design with validation
- Collections: restaurants, users, ratings, comments
- Text and geospatial indexes
- CSV data import scripts
- Database backup system

### Sprint 2 (Completed) 
- RESTful API with Express.js
- Full CRUD operations for restaurants
- Rating system with automatic average calculation
- Comment management system
- Input validation with express-validator
- Error handling middleware
- Security headers with Helmet
- CORS configuration
- Request logging
- Comprehensive API testing

### Sprint 3 (Current) 
- **Advanced Text Search**
  - Search by restaurant name, cuisine, or description
  
- **Multi-Parameter Filtering**
  - Filter by cuisine type
  - Filter by city/location
  - Filter by price range (single or multiple)
  - Filter by rating range (min/max)
  - Combine multiple filters
  
- **Flexible Sorting**
  - Sort by name (A-Z or Z-A)
  - Sort by rating (highest/lowest)
  - Sort by price range
  
- **Geospatial Search**
  - Find restaurants near a location
  - Distance-based filtering (radius in km)

  
- **Statistics & Analytics**
  - Restaurant counts by cuisine
  - Distribution by price range
  - Distribution by city
  - Average ratings and statistics
  - Top-rated restaurants
  
- **Performance Optimizations**
  - In-memory caching for frequent queries
  - Response time monitoring
  - Query performance tracking

---
### Updated Repository Structure

```
tattler-restaurant-platform/
│
├── src/
│   ├── config/
│   │   ├── database.js              # MongoDB connection singleton
│   │   └── testConnection.js        # Database connection test
│   │
│   ├── controllers/
│   │   ├── restaurantController.js  # Restaurant CRUD operations
│   │   ├── ratingController.js      # Rating management
│   │   └── commentController.js     # Comment management
│   │   └── testController.js        # testController
│   │
│   ├── middleware/
│   │   ├── errorHandler.js          # Global error handling
│   │   ├── validators.js            # Input validation rules
│   │   └── logger.js                # Request logging
│   │   └── cache.js                 # Cache
│   │   └── performance.js           # X-Response-Time
│   │
│   ├── routes/
│   │   ├── restaurantRoutes.js      # Restaurant endpoints
│   │   ├── ratingRoutes.js          # Rating endpoints
│   │   └── commentRoutes.js         # Comment endpoints
│   │
│   └── server.js                    # Express app entry point
│
├── scripts/
│   ├── dbConnection.js              # Legacy DB connection
│   ├── createCollections.js         # Collection creation script
│   ├── importData.js                # CSV import script
│   ├── analyzeQueries.js            # AnalyzeQueryPerformance
│   ├── backupDatabase.js            # Database backup script
│   └── checkIndexes.js              # Get a list of all indexes on the collection.
│   ├── codeQualityCheck.js          # Review files on repository
│   ├── finalSystemTest.js           # Script to test some endpoints
│   ├── loadTest.js                  # Tests MongoDB to with 10 requests
│   ├── migrateToGeoJSON.js          # Transforming data to a different format
│   └── performanceTest.js           # Performance test
│
├── data/
│   ├── csv/                         # Source CSV files
│   └── backup/                      # Database backups
│
├── tests/
│   ├── screenshots_sprint1/         # MongoDB Atlas screenshots
│   ├── screenshots_sprint2/         # Postman test screenshots
│   ├── screenshots_sprint3/         # Postamn test and performance screenshots
│   └── JSON Collections             # JSON files with collections for Postman
│
├── docs/
│   ├── SCHEMA.md                    # Database schema documentation
│   ├── API_DOCUMENTATION.md         # API endpoints documentation
│   ├── COLLABORATORS.md             # Collaborators
│   ├── PERFORMANCE_REPORT.md        # Performance report
│   ├── SPRINT3_FEAUTURES.md         # Planeation for Sprint 3
│   ├── PEER_REVIEW.md               # Format for peer review
│   ├── SPRINT2_SUMMARY.md           # Sprint 2 summary report
│   └── SPRINT3_SUMMARY.md           # Sprint 3 summary report
│
├── .env                             # Environment variables (not in repo)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Node.js dependencies
└── README.md                        # This file
```

##  Quick Start

### Prerequisites
- Node.js v18+ installed
- npm v6+ installed
- MongoDB Atlas account
- Git installed
- Postman or Insomnia (for API testing). The current project was testing usign Postman.

### Installation

```bash
# Clone repository
git clone https://github.com/ramsalue/tattler-restaurant-platform.git
cd tattler-restaurant-platform

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection string

# Set up database (first time only)
npm run create-collections
npm run import-data

# Start server
npm run dev
```

Server will be available at: `http://localhost:3000`

---

## API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Search & Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/restaurants` | Get all restaurants with filtering and sorting |
| GET | `/restaurants/search` | Text search across name, cuisine, description |
| GET | `/restaurants/nearby` | Find restaurants near coordinates |
| GET | `/restaurants/stats` | Get restaurant statistics |
| GET | `/restaurants/:id` | Get single restaurant by ID |

### Restaurant Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/restaurants` | Create new restaurant |
| PUT | `/restaurants/:id` | Update restaurant |
| DELETE | `/restaurants/:id` | Delete restaurant |

### Ratings & Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/restaurants/:id/ratings` | Get restaurant ratings |
| POST | `/restaurants/:id/ratings` | Add rating |
| PUT | `/restaurants/:id/ratings/:ratingId` | Update rating |
| DELETE | `/restaurants/:id/ratings/:ratingId` | Delete rating |
| GET | `/restaurants/:id/comments` | Get restaurant comments |
| POST | `/restaurants/:id/comments` | Add comment |
| PUT | `/restaurants/:id/comments/:commentId` | Update comment |
| DELETE | `/restaurants/:id/comments/:commentId` | Delete comment |

---

## API Usage Examples

### Text Search
```bash
# Search for restaurants
GET /api/v1/restaurants/search?q=pizza

# Search with sorting
GET /api/v1/restaurants/search?q=Mexican&sortBy=rating&order=desc
```

### Advanced Filtering
```bash
# Filter by cuisine
GET /api/v1/restaurants?cuisine=Italian

# Multiple filters
GET /api/v1/restaurants?cuisine=Mexican&priceRange=$$&minRating=4.0

# Filter by multiple price ranges
GET /api/v1/restaurants?priceRange=$$,$$$

# Filter by city and amenities
GET /api/v1/restaurants?city=Mexico City&amenities=WiFi,Parking
```

### Sorting
```bash
# Sort by rating (highest first)
GET /api/v1/restaurants?sortBy=rating&order=desc

# Sort by name alphabetically
GET /api/v1/restaurants?sortBy=name&order=asc

# Sort by popularity
GET /api/v1/restaurants?sortBy=totalRatings&order=desc
```

### Geospatial Search
```bash
# Find nearby restaurants (within 5km)
GET /api/v1/restaurants/nearby?latitude=19.4326&longitude=-99.1332&radius=5

# Nearby with filters
GET /api/v1/restaurants/nearby?latitude=19.4326&longitude=-99.1332&radius=10&minRating=4&cuisine=Mexican
```

### Combined Query Example
```bash
# Search + Filter + Sort + Paginate
GET /api/v1/restaurants?cuisine=Italian&city=Mexico City&priceRange=$$,$$$&minRating=4.0&sortBy=rating&order=desc&limit=10&page=1
```

### Statistics
```bash
# Get restaurant statistics
GET /api/v1/restaurants/stats
```

---

##  Query Parameters Reference

### Common Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `limit` | integer | Results per page (1-100) | `limit=20` |
| `page` | integer | Page number (≥1) | `page=2` |
| `sortBy` | string | Sort field | `sortBy=rating` |
| `order` | string | Sort order (asc/desc) | `order=desc` |

### Filter Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `cuisine` | string | Cuisine type | `cuisine=Mexican` |
| `city` | string | City name | `city=Mexico City` |
| `priceRange` | string | Price range ($-$$$$) | `priceRange=$$` |
| `minRating` | number | Minimum rating (0-5) | `minRating=4.0` |
| `maxRating` | number | Maximum rating (0-5) | `maxRating=5.0` |
| `amenities` | string | Comma-separated list | `amenities=WiFi,Parking` |

### Search Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` or `query` | string | Search term | `q=taco` |

### Geospatial Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `latitude` | number | Latitude (-90 to 90) | `latitude=19.4326` |
| `longitude` | number | Longitude (-180 to 180) | `longitude=-99.1332` |
| `radius` | number | Search radius in km | `radius=5` |

---

##  Response Format

### Success Response
```json
{
  "status": "success",
  "results": 5,
  "total": 23,
  "page": 1,
  "totalPages": 5,
  "filters": {
    "cuisine": "Mexican",
    "minRating": 4.0
  },
  "sort": {
    "field": "rating",
    "order": "desc"
  },
  "data": {
    "restaurants": [ /* array of restaurants */ ]
  }
}
```

### Error Response
```json
{
  "status": "fail",
  "message": "Error description",
  "errors": [ /* validation errors */ ]
}
```

---

##  Testing

### Postman Collection
Import the collection from `tests/Tattler_API_Sprint3_Collection.json`

### Run All Tests
1. Open Postman
2. Select the collection
3. Click "Run" button
4. Review test results

### Manual Testing Examples
```bash
# Health check
curl http://localhost:3000/health

# Search
curl "http://localhost:3000/api/v1/restaurants/search?q=pizza"

# Filter
curl "http://localhost:3000/api/v1/restaurants?cuisine=Mexican&minRating=4"

# Nearby
curl "http://localhost:3000/api/v1/restaurants/nearby?latitude=19.4326&longitude=-99.1332&radius=5"
```

---

##  Performance Features

### Caching
- In-memory cache for GET requests
- 5-minute TTL (Time To Live)
- Automatic cache invalidation on data modifications
- Cache size limit: 100 entries

### Monitoring
- Response time tracking


### Database Optimization
- Compound indexes for common queries
- Text indexes for search
- Geospatial indexes for location queries
- Query performance analysis

---

##  Security

### Implemented
-  Helmet.js for HTTP security headers
-  CORS with configurable origins
-  Input validation and sanitization
-  MongoDB injection prevention
-  Rate limiting on database queries
-  Error message sanitization

## Version History

### Version 2.1.0 (Sprint 3) - Current
- Added advanced text search
- Implemented multi-parameter filtering
- Added flexible sorting options
- Implemented geospatial search
- Added restaurant statistics
- Performance optimization with caching
- Response time monitoring

### Version 2.0.2 (Sprint 2)
- RESTful API with Express.js
- Restaurant CRUD operations
- Rating and comment systems
- Input validation and error handling

### Version 1.0.0 (Sprint 1)
- MongoDB database setup
- Collections and indexes
- Data import scripts

---

## Contact & Support

- **Developer**: Luis E Ramirez
- **Email**: ramsalue@gmail.com
- **GitHub**: https://github.com/ramsalue
- **Institution**: Digital NAO

---

**Last Updated**: 12-10-2025  
**Version**: 2.1.0  
**Status**: Sprint 3 Complete 