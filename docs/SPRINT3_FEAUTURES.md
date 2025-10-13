# Sprint 3: Search and Filtering Features Specification

## Feature 1: Text Search

### Endpoint
`GET /api/v1/restaurants/search`

### Query Parameters
- `q` or `query` (string): Search term

### Search Fields
- Restaurant name
- Cuisine type
- Description

### Examples
```
GET /api/v1/restaurants/search?q=pizza
GET /api/v1/restaurants/search?query=Mexican
```

### Expected Behavior
- Case-insensitive matching
- Partial word matching
- Results sorted by relevance (text score)

---

## Feature 2: Advanced Filtering

### Endpoint
`GET /api/v1/restaurants` (enhanced existing endpoint)

### New Query Parameters

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `cuisine` | string | `Mexican` | Filter by cuisine type |
| `city` | string | `Mexico City` | Filter by city |
| `priceRange` | string | `$$` or `$$,$$$` | Filter by price (comma-separated for multiple) |
| `minRating` | number | `4.0` | Minimum rating (0-5) |
| `maxRating` | number | `5.0` | Maximum rating (0-5) |
| `amenities` | string | `WiFi,Parking` | Filter by amenities (comma-separated) |

### Examples
```
GET /api/v1/restaurants?cuisine=Mexican&city=Mexico City
GET /api/v1/restaurants?priceRange=$$,$$&minRating=4.0
GET /api/v1/restaurants?amenities=WiFi,Parking&cuisine=Italian
```

### Filter Logic
- Multiple filters use AND logic
- Multiple values for same parameter use OR logic
- All filters can be combined

---

## Feature 3: Sorting

### Query Parameters

| Parameter | Type | Values | Description |
|-----------|------|--------|-------------|
| `sortBy` | string | `name`, `rating`, `totalRatings`, `priceRange` | Field to sort by |
| `order` | string | `asc`, `desc` | Sort order |

### Examples
```
GET /api/v1/restaurants?sortBy=rating&order=desc
GET /api/v1/restaurants?sortBy=name&order=asc
GET /api/v1/restaurants?cuisine=Italian&sortBy=rating&order=desc
```

### Default Behavior
- Default sort: `rating` descending
- If no results, return empty array

---

## Feature 4: Combined Search, Filter, and Sort

### Example Complex Query
```
GET /api/v1/restaurants?
  q=taco&
  cuisine=Mexican&
  city=Mexico City&
  priceRange=$$&
  minRating=4.0&
  amenities=WiFi&
  sortBy=rating&
  order=desc&
  limit=10&
  page=1
```

### Response Format
```json
{
  "status": "success",
  "results": 5,
  "total": 23,
  "page": 1,
  "totalPages": 3,
  "filters": {
    "query": "taco",
    "cuisine": "Mexican",
    "city": "Mexico City",
    "priceRange": ["$$"],
    "minRating": 4.0,
    "amenities": ["WiFi"]
  },
  "sort": {
    "field": "rating",
    "order": "desc"
  },
  "data": {
    "restaurants": [ /* ... */ ]
  }
}
```

---

## Feature 5: Geospatial Search

### Endpoint
`GET /api/v1/restaurants/nearby`

### Query Parameters
- `latitude` (number): User's latitude
- `longitude` (number): User's longitude
- `radius` (number): Search radius in kilometers
- `limit` (number): Maximum results

### Example
```
GET /api/v1/restaurants/nearby?latitude=19.4326&longitude=-99.1332&radius=5&limit=10
```

### Response
Returns restaurants sorted by distance from provided coordinates.

---
## Testing Requirements

### Test Cases
1. Text search with various terms
2.  Single filter (each type)
3.  Multiple filters combined
4.  Sorting by each field
5.  Sorting with filters
6.  Pagination with filters
7.  Complex queries (search + filters + sort)
8.  Edge cases (no results, invalid parameters)
9.  Performance testing (large datasets)

### Postman Collection Updates
- Add new search endpoint tests
- Add filter combination tests
- Add sorting tests
- Add complex query tests

---

**Document Version**: 1.0  
**Created**: 10-10-2025  
**Status**: Planning Complete