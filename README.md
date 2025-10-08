
# Tattler Restaurant Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## Project Description

Tattler is a modern restaurant directory platform that transforms the traditional static restaurant listing experience into a dynamic, personalized application. Using MongoDB for flexible data storage and Express.js for RESTful API services, Tattler enables users to discover restaurants based on their preferences, rate their experiences, and receive personalized recommendations.

### Problem Statement
The original Tattler platform experienced a significant drop in user traffic due to outdated restaurant information and lack of personalization. This project aims to revitalize the platform by implementing:
- Real-time, up-to-date restaurant data
- User-driven content through ratings and reviews
- Personalized restaurant recommendations
- Advanced search and filtering capabilities

### Solution
A complete platform transformation using:
- **MongoDB Atlas** for scalable, flexible data storage
- **Express.js** for robust RESTful API development
- **JSON-based data structures** for easy integration and updates
- **User preference tracking** for personalized experiences

---

## Repository Structure

```
tattler-restaurant-platform/
│
├── data/
│   ├── csv/                      # CSV source files
│   │   ├── restaurants.csv
│   │   └── users.csv
│   └── backup/                   # Database backups
│       ├── tattler_backup.json
│       └── indexes_backup.json
│
├── scripts/
│   ├── dbConnection.js          # MongoDB connection utility
│   ├── createCollections.js     # Collection creation script
│   ├── importData.js            # CSV to MongoDB import
│   └── backupDatabase.js        # Database backup script
│
├── screenshots/                  # Database screenshots
│   ├── 01_database_overview.png
│   ├── 02_restaurants_collection.png
│   ├── 03_restaurants_indexes.png
│   └── 04_users_collection.png
│
├── docs/                        # Additional documentation
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Node.js dependencies
└── README.md                    # This file
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

## Installation Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account
- Git

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
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tattler_db
   DB_NAME=tattler_db
   PORT=3000
   NODE_ENV=development
   ```

### Step 4: Create Database Collections
```bash
node scripts/createCollections.js
```

### Step 5: Import Sample Data
```bash
node scripts/importData.js
```

### Step 6: Verify Installation
Check MongoDB Atlas to confirm collections and data are created successfully.

---

## Usage Instructions

### Creating a Database Backup
```bash
node scripts/backupDatabase.js
```
This will create backup files in `data/backup/` directory.

### Importing Data from CSV
1. Place your CSV files in `data/csv/` directory
2. Ensure CSV format matches the expected schema
3. Run the import script:
```bash
node scripts/importData.js
```

### Restoring from Backup
To restore data from backup:
1. Ensure you have a backup file in `data/backup/`
2. Use MongoDB Compass or mongorestore command
3. Or create a custom restore script based on your needs

---

## Development Guidelines

### Version Control (XXX Versioning)
This project follows semantic versioning with XXX format:
- **First X (Major)**: Breaking changes, major features (e.g., 1.0.0 → 2.0.0)
- **Second X (Minor)**: New features, backward compatible (e.g., 1.0.0 → 1.1.0)
- **Third X (Patch)**: Bug fixes, minor corrections (e.g., 1.0.0 → 1.0.1)

**Current Version**: 1.0.0
- Major: Database foundation established
- Minor: Initial collections created
- Patch: No fixes yet

### Git Workflow
```bash
# Make changes
git add .
git commit -m "feat: description of feature"
git push origin main

# Version tagging
git tag -a v1.0.0 -m "Sprint 1 - Database Setup Complete"
git push origin v1.0.0
```

### Commit Message Conventions
```
feat: new feature
fix: bug fix
docs: documentation changes
style: formatting, missing semicolons, etc.
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

---

## Testing

### Manual Testing Checklist
- [ ] MongoDB Atlas connection successful
- [ ] All 4 collections created
- [ ] Indexes created on all collections
- [ ] Sample data imported successfully
- [ ] Backup file generated
- [ ] Screenshots captured and saved

### Verification Queries
Connect to MongoDB Atlas and run these queries to verify:

```javascript
// Check restaurants count
db.restaurants.countDocuments()

// Verify text search index works
db.restaurants.find({ $text: { $search: "Mexican" } })

// Check users
db.users.countDocuments()

// Verify indexes
db.restaurants.getIndexes()
```

---

## Contributing

This is a academic project for Digital NAO. For questions or issues:
1. Check the documentation
2. Review screenshots in `/screenshots`
3. Contact the development team

---

## License

MIT License - See LICENSE file for details

---

## Project Team

- **Project Manager**: Alejandra
- **Lead Developer**: Elian
- **Database Administrator**: Luis Ramirez
- **Institution**: Digital NAO

---

## Project Timeline

### Sprint 1 (Completed)
- Database setup and configuration
- MongoDB Atlas cluster creation
- Collections and indexes implementation
- CSV import scripts
- Database backup system

### Sprint 2 (Upcoming)
- RESTful API development with Express.js
- CRUD endpoints implementation
- Rating and comment systems

### Sprint 3 (Planned)
- Advanced search functionality
- Filtering and sorting features
- Personalized recommendations

---

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Node.js Driver](https://docs.mongodb.com/drivers/node/)
- [Semantic Versioning](https://semver.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)


## Future Enhancements

- Automated backup scheduling
- Data validation improvements
- Additional sample datasets
- Performance optimization
- Migration scripts for schema updates

---

**Last Updated**: [08/10/2025]
**Version**: 1.0.0
**Status**: Sprint 1 Complete