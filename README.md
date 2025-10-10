
# Tattler Restaurant Platform

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Express](https://img.shields.io/badge/Express.js-4.18-lightgrey)
![License](https://img.shields.io/badge/license-MIT-yellow)

## Project Description

Tattler is a modern restaurant directory platform with a RESTful API built using Express.js and MongoDB. The platform enables users to discover restaurants, rate their experiences, leave comments, and receive personalized recommendations.

### Problem Statement
The original Tattler platform experienced a significant drop in user traffic due to outdated restaurant information and lack of personalization. This project revitalizes the platform by implementing:
- Real-time, up-to-date restaurant data
- User-driven content through ratings and reviews
- RESTful API for easy integration
- Comprehensive search and filtering capabilities

### Solution Architecture
- **Backend**: Express.js RESTful API
- **Database**: MongoDB Atlas (NoSQL)
- **API Version**: v1
- **Data Format**: JSON
- **Authentication**: To be implemented in Sprint 3

---

## Features

### Sprint 1 (Completed)
-  MongoDB Atlas database configuration
-  Database schema design with validation
-  Collections: restaurants, users, ratings, comments
-  Text and geospatial indexes
-  CSV data import scripts
-  Database backup system

### Sprint 2 (Current)
-  RESTful API with Express.js
-  Full CRUD operations for restaurants
-  Rating system with automatic average calculation
-  Comment management system
-  Input validation with express-validator
-  Error handling middleware
-  Request logging with Morgan
-  Security headers with Helmet
-  CORS configuration
-  Comprehensive API testing with Postman

### Sprint 3 (Upcoming)
-  Advanced search functionality
-  Multi-parameter filtering
-  Sorting and pagination enhancements
-  Personalized recommendations
-  User authentication with JWT

---

## Updated Repository Structure

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
│   │
│   ├── middleware/
│   │   ├── errorHandler.js          # Global error handling
│   │   ├── validators.js            # Input validation rules
│   │   └── logger.js                # Request logging
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
│   └── backupDatabase.js            # Database backup script
│
├── data/
│   ├── csv/                         # Source CSV files
│   └── backup/                      # Database backups
│
├── tests/
│   └── screenshots_sprint2/         # Postman test screenshots
├── └── screenshots_sprint1/         # MongoDB Atlas screenshots
│
├── docs/
│   ├── SCHEMA.md                    # Database schema documentation
│   ├── IMPORT_GUIDE.md              # Data import guide
│   ├── API_DOCUMENTATION.md         # API endpoints documentation
│   └── SPRINT2_SUMMARY.md           # Sprint 2 summary report
│
├── .env                             # Environment variables (not in repo)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Node.js dependencies
└── README.md                        # This file
```
## Database Schema

### Collections

#### 1. Restaurants Collection
Stores restaurant information including location, cuisine, ratings, and amenities.

**Fields:**
- `name` (string, required): Restaurant name
- `cuisine` (string, required): Type of cuisine
- `location` (object, required):
  - `address` (string)
  - `city` (string)
  - `state` (string)
  - `zipCode` (string)
  - `coordinates` (object):
    - `latitude` (double)
    - `longitude` (double)
- `priceRange` (string): $, $$, $$$, or $$$$
- `rating` (double): Average rating (0-5)
- `totalRatings` (int): Number of ratings
- `amenities` (array): Available amenities
- `phone` (string): Contact phone
- `website` (string): Restaurant website
- `description` (string): Restaurant description
- `images` (array): Image URLs
- `openingHours` (object): Operating hours
- `createdAt` (date): Creation timestamp
- `updatedAt` (date): Last update timestamp

**Indexes:**
- Text index on: name, cuisine, description
- Single field indexes on: location.city, cuisine, rating, priceRange
- Geospatial index on: location.coordinates

#### 2. Users Collection
Stores user profiles and preferences for personalization.

**Fields:**
- `userId` (string, required, unique): User identifier
- `email` (string, required, unique): User email
- `username` (string): Display name
- `preferences` (object):
  - `favoriteCuisines` (array): Preferred cuisines
  - `preferredPriceRange` (array): Price preferences
  - `dietaryRestrictions` (array): Dietary needs
- `favoriteRestaurants` (array): Saved restaurant IDs
- `createdAt` (date): Account creation date

**Indexes:**
- Unique index on: userId, email

#### 3. Ratings Collection
Stores individual user ratings for restaurants.

**Fields:**
- `restaurantId` (ObjectId, required): Reference to restaurant
- `userId` (string, required): User who rated
- `rating` (int, required): Rating value (1-5)
- `review` (string): Optional review text
- `createdAt` (date): Rating timestamp

**Indexes:**
- Single field indexes on: restaurantId, userId, createdAt

#### 4. Comments Collection
Stores user comments and discussions about restaurants.

**Fields:**
- `restaurantId` (ObjectId, required): Reference to restaurant
- `userId` (string, required): Comment author
- `username` (string): Author's display name
- `comment` (string, required): Comment text
- `createdAt` (date): Comment timestamp
- `updatedAt` (date): Last edit timestamp

**Indexes:**
- Single field indexes on: restaurantId, userId, createdAt

---

## Installation & Setup

### Prerequisites
- Node.js v18+ installed
- npm v6+ installed
- MongoDB Atlas account
- Git installed
- Postman or Insomnia (for API testing)

### Step 1: Clone the Repository
```bash
git clone https://github.com/ramsalue/tattler-restaurant-platform.git
cd tattler-restaurant-platform
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your MongoDB Atlas connection string:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tattler_db
   DB_NAME=tattler_db
   
   # API Configuration
   PORT=3000
   NODE_ENV=development
   API_VERSION=v1
   
   # Server Configuration
   HOST=localhost
   ALLOWED_ORIGINS=http://localhost:3000
   ```

### Step 4: Set Up Database (First Time Only)
```bash
# Create collections and indexes
npm run create-collections

# Import sample data
npm run import-data
```

### Step 5: Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be available at: `http://localhost:3000`

---

## API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### API Endpoints

#### Health Check
```http
GET /health
```
Returns API health status.

#### Restaurants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/restaurants` | Get all restaurants (paginated) |
| GET | `/restaurants/:id` | Get single restaurant by ID |
| POST | `/restaurants` | Create new restaurant |
| PUT | `/restaurants/:id` | Update restaurant |
| DELETE | `/restaurants/:id` | Delete restaurant |

**Query Parameters for GET /restaurants:**
- `limit` (default: 20): Number of results per page
- `page` (default: 1): Page number

**Example Request:**
```bash
curl http://localhost:3000/api/v1/restaurants?limit=10&page=1
```

**Example POST Body:**
```json
{
  "name": "New Restaurant",
  "cuisine": "Mexican",
  "location": {
    "address": "123 Main St",
    "city": "Mexico City",
    "state": "CDMX",
    "zipCode": "01000",
    "coordinates": {
      "latitude": 19.4326,
      "longitude": -99.1332
    }
  },
  "priceRange": "$$",
  "phone": "555-0123",
  "website": "www.newrestaurant.com",
  "description": "Authentic Mexican cuisine"
}
```

#### Ratings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/restaurants/:restaurantId/ratings` | Get all ratings for a restaurant |
| GET | `/restaurants/:restaurantId/ratings/:ratingId` | Get single rating |
| POST | `/restaurants/:restaurantId/ratings` | Create new rating |
| PUT | `/restaurants/:restaurantId/ratings/:ratingId` | Update rating |
| DELETE | `/restaurants/:restaurantId/ratings/:ratingId` | Delete rating |

**Example POST Body:**
```json
{
  "userId": "user001",
  "rating": 5,
  "review": "Excellent food and service!"
}
```

**Note:** Creating a rating automatically updates the restaurant's average rating and totalRatings count.

#### Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/restaurants/:restaurantId/comments` | Get all comments for a restaurant |
| GET | `/restaurants/:restaurantId/comments/:commentId` | Get single comment |
| POST | `/restaurants/:restaurantId/comments` | Create new comment |
| PUT | `/restaurants/:restaurantId/comments/:commentId` | Update comment |
| DELETE | `/restaurants/:restaurantId/comments/:commentId` | Delete comment |

**Example POST Body:**
```json
{
  "userId": "user001",
  "username": "John Doe",
  "comment": "Great atmosphere and friendly staff!"
}
```

---

## Testing

### Manual Testing with Postman

1. **Import Collection:**
   - Open Postman
   - Import the collection from `tests/Tattler_API_Collection.json`

2. **Set Environment:**
   - Create environment with variable `base_url`: `http://localhost:3000`
   - Create environment with variable `api_version`: `v1`

3. **Run Tests:**
   - Execute requests in order
   - Verify responses match expected status codes
   - Check data integrity in MongoDB Atlas

### Automated Tests
```bash
npm test
```

### Test Coverage
- Health check endpoint
- Restaurant CRUD operations
- Rating creation and management
- Comment creation and management
- Input validation
- Error handling
- Pagination

---

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for automatic server restart on file changes.

### Code Style Guidelines
- Use ES6+ syntax
- Follow RESTful API conventions
- Use async/await for asynchronous operations
- Implement proper error handling
- Add comments for complex logic
- Use meaningful variable names

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-endpoint

# Make changes and commit
git add .
git commit -m "feat: add new endpoint for X"

# Push to GitHub
git push origin feature/new-endpoint
```

### Commit Message Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## Security

### Current Implementation
- Helmet.js for security headers
- CORS configuration
- Input validation with express-validator
- MongoDB injection prevention
- Error message sanitization

### To Be Implemented (Sprint 3)
- JWT authentication
- Rate limiting
- Request body size limits
- API key authentication

---

## Troubleshooting

### Server Won't Start
```bash
# Check if port 3000 is already in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change PORT in .env
```

### Database Connection Error
1. Verify MongoDB Atlas credentials in `.env`
2. Check network access in MongoDB Atlas (allow 0.0.0.0/0)
3. Ensure cluster is running (not paused)
4. Test connection:
   ```bash
   node src/config/testConnection.js
   ```

### Import Data Fails
1. Ensure collections are created first:
   ```bash
   npm run create-collections
   ```
2. Check CSV file format matches expected schema
3. Verify MongoDB connection is active

### Validation Errors
- Check request body matches schema requirements
- Verify all required fields are included
- Ensure data types are correct (e.g., latitude/longitude are numbers)

---
## Contributing

This is an academic project for Digital NAO. For questions or issues:
1. Check the documentation
2. Review test screenshots in `/tests/screenshots`
3. Contact the development team

---

## Version History

### Version 2.0.0 (Sprint 2) - Current
- Added Express.js RESTful API
- Implemented restaurant CRUD operations
- Added rating system with automatic average calculation
- Implemented comment management
- Added input validation and error handling
- Configured security middleware
- Created comprehensive Postman test suite

### Version 1.0.0 (Sprint 1)
- MongoDB Atlas database setup
- Database schema design
- Collections and indexes
- CSV import scripts
- Database backup system

---

## Contact & Support

- **Developer**: Luis E. Ramirez
- **Email**: ramsalue@gmail.com
- **GitHub**: https://github.com/ramsalue
- **Institution**: Digital NAO

---
## Acknowledgments

- Digital NAO for project requirements
- MongoDB Atlas for database hosting
- Express.js community for excellent documentation
- Postman for API testing tools

---

**Last Updated**: 10-10-2025  
**Version**: 2.0.0  
**Status**: Sprint 2 Complete 
