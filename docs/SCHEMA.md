# Database Schema Documentation

## Overview
This document provides detailed information about the Tattler database schema design.

## Entity Relationship Diagram

```
┌─────────────────┐
│   RESTAURANTS   │
│   (Main Entity) │
└────────┬────────┘
         │
         ├──────────┐
         │          │
    ┌────▼─────┐ ┌─▼────────┐
    │ RATINGS  │ │ COMMENTS │
    └──────────┘ └──────────┘
         │          │
         └────┬─────┘
              │
         ┌────▼────┐
         │  USERS  │
         └─────────┘
```

## Collection Details

### 1. Restaurants

**Purpose**: Central repository for restaurant information

**Key Design Decisions**:
- Embedded location object for better query performance
- Geospatial coordinates for distance-based searches
- Amenities as array for flexible filtering
- Pre-calculated rating field for performance

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
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
  "amenities": ["WiFi", "Parking", "Outdoor Seating"],
  "phone": "555-0101",
  "website": "www.lataqueria.com",
  "description": "Authentic Mexican tacos and traditional dishes",
  "images": ["url1.jpg", "url2.jpg"],
  "openingHours": {
    "monday": "9:00 AM - 10:00 PM",
    "tuesday": "9:00 AM - 10:00 PM"
  },
  "createdAt": ISODate("2024-01-01T00:00:00Z"),
  "updatedAt": ISODate("2024-01-01T00:00:00Z")
}
```

### 2. Users

**Purpose**: Store user profiles and preferences for personalization

**Key Design Decisions**:
- Preferences embedded for quick access
- Favorite cuisines array for recommendation algorithm
- Reference to favorite restaurants for quick retrieval

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "userId": "user001",
  "email": "ana.garcia@email.com",
  "username": "ana_garcia",
  "preferences": {
    "favoriteCuisines": ["Mexican", "Italian"],
    "preferredPriceRange": ["$$", "$$$"],
    "dietaryRestrictions": ["vegetarian"]
  },
  "favoriteRestaurants": [ObjectId("..."), ObjectId("...")],
  "createdAt": ISODate("2024-01-01T00:00:00Z")
}
```

### 3. Ratings

**Purpose**: Track individual user ratings for restaurants

**Key Design Decisions**:
- Separate collection for scalability
- Links to both restaurant and user
- Optional review text field
- Timestamp for temporal analysis

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "restaurantId": ObjectId("..."),
  "userId": "user001",
  "rating": 5,
  "review": "Amazing food and great service!",
  "createdAt": ISODate("2024-01-15T14:30:00Z")
}
```

### 4. Comments

**Purpose**: Enable user discussions and feedback

**Key Design Decisions**:
- Separate from ratings for flexibility
- Username stored for display without user lookup
- Update timestamp for edit tracking

**Sample Document**:
```json
{
  "_id": ObjectId("..."),
  "restaurantId": ObjectId("..."),
  "userId": "user001",
  "username": "ana_garcia",
  "comment": "Great atmosphere, highly recommend the tacos!",
  "createdAt": ISODate("2024-01-15T14:30:00Z"),
  "updatedAt": ISODate("2024-01-15T14:30:00Z")
}
```

## Index Strategy

### Restaurants Collection Indexes

1. **Text Index**: `{ name: "text", cuisine: "text", description: "text" }`
   - Purpose: Full-text search functionality
   - Used by: Search API endpoint

2. **City Index**: `{ "location.city": 1 }`
   - Purpose: Filter restaurants by city
   - Used by: Location-based queries

3. **Cuisine Index**: `{ cuisine: 1 }`
   - Purpose: Filter by cuisine type
   - Used by: Category browsing

4. **Rating Index**: `{ rating: -1 }`
   - Purpose: Sort by highest rated
   - Used by: Top restaurants queries

5. **Price Range Index**: `{ priceRange: 1 }`
   - Purpose: Filter by price
   - Used by: Budget-based filtering

6. **Coordinates Index**: `{ "location.coordinates.latitude": 1, "location.coordinates.longitude": 1 }`
   - Purpose: Geospatial queries
   - Used by: Distance-based searches

### Performance Considerations

- Text indexes enable fast full-text search
- Compound indexes may be added in Sprint 3 for complex queries
- Regular monitoring of index usage recommended
- Consider index size vs. query performance tradeoff

## Data Validation

All collections use JSON Schema validation to ensure data integrity:
- Required fields enforced at database level
- Type checking for all fields
- Enum constraints for categorical fields (e.g., priceRange)
- Range validation for numeric fields (e.g., rating 0-5)

## Scalability Considerations

1. **Horizontal Scaling**: MongoDB Atlas supports automatic sharding
2. **Index Optimization**: Regular review of index usage
3. **Data Archiving**: Plan for archiving old comments/ratings
4. **Caching Strategy**: To be implemented in Sprint 2

## Future Schema Enhancements

- Add `isActive` field for soft deletes
- Implement `tags` array for flexible categorization
- Add `photos` sub-document with metadata
- Consider separate `menu` collection for detailed menu items
```

### Step 8.2: Create Import Guide

Create `docs/IMPORT_GUIDE.md`:

```markdown
# Data Import Guide

## Overview
This guide explains how to import data into the Tattler MongoDB database.

## Prerequisites
- Node.js installed
- MongoDB Atlas cluster configured
- Environment variables set in `.env`

## CSV File Format

### Restaurants CSV Format
```csv
name,cuisine,address,city,state,zipCode,latitude,longitude,priceRange,phone,website,description
Restaurant Name,Cuisine Type,Street Address,City Name,State,ZIP,LAT,LONG,$$,Phone,URL,Description
```

**Required Fields**:
- name
- cuisine
- address, city
- latitude, longitude

**Optional Fields**:
- state, zipCode
- priceRange (default: $$)
- phone, website, description

### Users CSV Format
```csv
userId,email,username,favoriteCuisines,preferredPriceRange
user001,email@example.com,username,Mexican;Italian,$$;$$$
```

**Required Fields**:
- userId
- email

**Optional Fields**:
- username
- favoriteCuisines (semicolon-separated)
- preferredPriceRange (semicolon-separated)