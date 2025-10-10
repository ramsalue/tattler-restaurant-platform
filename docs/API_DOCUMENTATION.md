# Tattler Restaurant API - Complete Documentation

## Base Information

**Base URL**: `http://localhost:3000/api/v1`  
**API Version**: v1  
**Content Type**: application/json  
**Authentication**: None (Sprint 2), JWT (Sprint 3)

---

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "status": "fail" | "error",
  "message": "Error description",
  "errors": [] // Validation errors (optional)
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Resource deleted successfully |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

---

## Endpoints

### 1. Health Check

**Endpoint**: `GET /health`

**Description**: Check API health status

**Response**:
```json
{
  "status": "success",
  "message": "Tattler API is running",
  "timestamp": "2025-10-08T12:00:00.000Z",
  "version": "v1"
}
```

---

### 2. Restaurants

#### 2.1 Get All Restaurants

**Endpoint**: `GET /restaurants`

**Query Parameters**:
- `limit` (integer, optional, default: 20): Results per page
- `page` (integer, optional, default: 1): Page number

**Example Request**:
```bash
GET /api/v1/restaurants?limit=10&page=2
```

**Response**:
```json
{
  "status": "success",
  "results": 10,
  "total": 50,
  "page": 2,
  "totalPages": 5,
  "data": {
    "restaurants": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "name": "La Taquería Mexicana",
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
        "rating": 4.5,
        "totalRatings": 120,
        "amenities": ["WiFi", "Parking"],
        "phone": "555-0101",
        "website": "www.lataqueria.com",
        "description": "Authentic Mexican tacos",
        "images": [],
        "openingHours": {},
        "createdAt": "2025-01-01T00:00:00.000Z",
        "updatedAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### 2.2 Get Restaurant by ID

**Endpoint**: `GET /restaurants/:id`

**URL Parameters**:
- `id` (string, required): Restaurant ObjectId

**Example Request**:
```bash
GET /api/v1/restaurants/507f1f77bcf86cd799439011
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "restaurant": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "La Taquería Mexicana",
      // ... full restaurant object
    }
  }
}
```

**Error Responses**:
- `404`: Restaurant not found
- `400`: Invalid ID format

#### 2.3 Create Restaurant

**Endpoint**: `POST /restaurants`

**Request Body**:
```json
{
  "name": "New Restaurant",
  "cuisine": "Italian",
  "location": {
    "address": "456 Test St",
    "city": "Test City",
    "state": "TC",
    "zipCode": "12345",
    "coordinates": {
      "latitude": 20.0,
      "longitude": -100.0
    }
  },
  "priceRange": "$$$",
  "phone": "555-0123",
  "website": "www.newrestaurant.com",
  "description": "Fine Italian dining",
  "amenities": ["WiFi", "Parking", "Valet"],
  "openingHours": {
    "monday": "11:00 AM - 10:00 PM",
    "tuesday": "11:00 AM - 10:00 PM"
  }
}
```

**Required Fields**:
- `name` (string, 2-100 characters)
- `cuisine` (string)
- `location.address` (string)
- `location.city` (string)
- `location.coordinates.latitude` (number, -90 to 90)
- `location.coordinates.longitude` (number, -180 to 180)

**Optional Fields**:
- `priceRange` (enum: $, $$, $$$, $$$$)
- `phone` (string)
- `website` (string, valid URL)
- `description` (string)
- `amenities` (array of strings)
- `openingHours` (object)

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "restaurant": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "New Restaurant",
      "rating": 0,
      "totalRatings": 0,
      // ... full restaurant object
    }
  }
}
```

#### 2.4 Update Restaurant

**Endpoint**: `PUT /restaurants/:id`

**URL Parameters**:
- `id` (string, required): Restaurant ObjectId

**Request Body** (all fields optional):
```json
{
  "name": "Updated Restaurant Name",
  "cuisine": "Updated Cuisine",
  "priceRange": "$$",
  "description": "Updated description",
  "amenities": ["WiFi", "Parking", "Delivery"]
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "restaurant": {
      // Updated restaurant object
    }
  }
}
```

#### 2.5 Delete Restaurant

**Endpoint**: `DELETE /restaurants/:id`

**URL Parameters**:
- `id` (string, required): Restaurant ObjectId

**Response**: `204 No Content`

**Note**: Also deletes all associated ratings and comments.

---

### 3. Ratings

#### 3.1 Get Restaurant Ratings

**Endpoint**: `GET /restaurants/:restaurantId/ratings`

**URL Parameters**:
- `restaurantId` (string, required): Restaurant ObjectId

**Response**:
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "ratings": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "restaurantId": "507f1f77bcf86cd799439011",
        "userId": "user001",
        "rating": 5,
        "review": "Excellent food!",
        "createdAt": "2025-01-15T14:30:00.000Z"
      }
    ]
  }
}
```

#### 3.2 Create Rating

**Endpoint**: `POST /restaurants/:restaurantId/ratings`

**URL Parameters**:
- `restaurantId` (string, required): Restaurant ObjectId

**Request Body**:
```json
{
  "userId": "user001",
  "rating": 5,
  "review": "Excellent food and service!"
}
```

**Required Fields**:
- `userId` (string)
- `rating` (integer, 1-5)

**Optional Fields**:
- `review` (string, max 500 characters)

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "rating": {
      "_id": "507f1f77bcf86cd799439013",
      "restaurantId": "507f1f77bcf86cd799439011",
      "userId": "user001",
      "rating": 5,
      "review": "Excellent food and service!",
      "createdAt": "2025-01-15T14:30:00.000Z"
    }
  }
}
```

**Note**: Creating a rating automatically updates the restaurant's `rating` and `totalRatings` fields.

**Error Responses**:
- `400`: User already rated this restaurant
- `404`: Restaurant not found

#### 3.3 Update Rating

**Endpoint**: `PUT /restaurants/:restaurantId/ratings/:ratingId`

**URL Parameters**:
- `restaurantId` (string, required): Restaurant ObjectId
- `ratingId` (string, required): Rating ObjectId

**Request Body**:
```json
{
  "rating": 4,
  "review": "Updated review text"
}
```

**Response**: `200 OK`

#### 3.4 Delete Rating

**Endpoint**: `DELETE /restaurants/:restaurantId/ratings/:ratingId`

**Response**: `204 No Content`

**Note**: Deleting a rating updates the restaurant's average rating.

---

### 4. Comments

#### 4.1 Get Restaurant Comments

**Endpoint**: `GET /restaurants/:restaurantId/comments`

**URL Parameters**:
- `restaurantId` (string, required): Restaurant ObjectId

**Query Parameters**:
- `limit` (integer, optional, default: 20): Results per page
- `page` (integer, optional, default: 1): Page number

**Response**:
```json
{
  "status": "success",
  "results": 10,
  "total": 45,
  "page": 1,
  "totalPages": 5,
  "data": {
    "comments": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "restaurantId": "507f1f77bcf86cd799439011",
        "userId": "user001",
        "username": "John Doe",
        "comment": "Great atmosphere!",
        "createdAt": "2025-01-15T14:30:00.000Z",
        "updatedAt": "2025-01-15T14:30:00.000Z"
      }
    ]
  }
}
```

#### 4.2 Create Comment

**Endpoint**: `POST /restaurants/:restaurantId/comments`

**URL Parameters**:
- `restaurantId` (string, required): Restaurant ObjectId

**Request Body**:
```json
{
  "userId": "user001",
  "username": "John Doe",
  "comment": "Great atmosphere and friendly staff!"
}
```

**Required Fields**:
- `userId` (string)
- `username` (string)
- `comment` (string, 1-500 characters)

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "comment": {
      "_id": "507f1f77bcf86cd799439014",
      "restaurantId": "507f1f77bcf86cd799439011",
      "userId": "user001",
      "username": "John Doe",
      "comment": "Great atmosphere and friendly staff!",
      "createdAt": "2025-01-15T14:30:00.000Z",
      "updatedAt": "2025-01-15T14:30:00.000Z"
    }
  }
}
```

#### 4.3 Update Comment

**Endpoint**: `PUT /restaurants/:restaurantId/comments/:commentId`

**URL Parameters**:
- `restaurantId` (string, required): Restaurant ObjectId
- `commentId` (string, required): Comment ObjectId

**Request Body**:
```json
{
  "comment": "Updated comment text here"
}
```

**Required Fields**:
- `comment` (string, 1-500 characters)

**Response**: `200 OK`

#### 4.4 Delete Comment

**Endpoint**: `DELETE /restaurants/:restaurantId/comments/:commentId`

**Response**: `204 No Content`

---

## Error Codes

### 400 Bad Request
```json
{
  "status": "fail",
  "errors": [
    {
      "field": "rating",
      "message": "Rating must be between 1 and 5"
    }
  ]
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "message": "Restaurant not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Something went wrong"
}
```

---

## Rate Limiting

**Current**: No rate limiting (Sprint 2)  
**Planned**: 100 requests per 15 minutes per IP (Sprint 3)

---

## Authentication

**Current**: No authentication required (Sprint 2)  
**Planned**: JWT-based authentication (Sprint 3)

---

## Changelog

### v1 (Sprint 2)
- Initial API release
- Restaurant CRUD operations
- Rating system
- Comment system
- Input validation
- Error handling

---

**Last Updated**: 10-10-2025 
**Version**: v1  
**Maintained by**: Luis E Ramirez
```