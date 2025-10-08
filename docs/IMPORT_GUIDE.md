## Import Process

### Step 1: Prepare CSV Files
1. Place CSV files in `data/csv/` directory
2. Verify column headers match expected format
3. Ensure no special characters in data
4. Remove any empty rows

### Step 2: Run Import Script
```bash
node scripts/importData.js
```

### Step 3: Verify Import
```bash
# Check MongoDB Atlas
# Or use MongoDB Compass
# Or run verification query
```

## Troubleshooting

### Common Issues

**Issue**: "Cannot find module 'mongodb'"
```bash
# Solution: Install dependencies
npm install
```

**Issue**: "MongoServerError: Authentication failed"
```bash
# Solution: Check credentials in .env file
# Verify MongoDB Atlas user has correct permissions
```

**Issue**: "CSV parsing error"
```bash
# Solution: Check CSV format
# Ensure no missing commas
# Remove special characters
```

**Issue**: "Duplicate key error"
```bash
# Solution: Check for duplicate emails/userIds
# Clear existing data if testing
```

## Data Validation

The import script validates:
- Required fields are present
- Email format is valid
- Coordinates are numeric
- Price range is valid enum value

## Bulk Import Tips

For large datasets:
1. Split into smaller CSV files (1000 rows each)
2. Import in batches
3. Monitor memory usage
4. Use `insertMany` with `ordered: false` for parallel processing

## Custom Import

To import custom data formats, modify `scripts/importData.js`:

```javascript
// Example: Import from JSON
const data = require('./custom_data.json');
await db.collection('restaurants').insertMany(data);
```

## Backup Before Import

Always backup before importing:
```bash
node scripts/backupDatabase.js
```

## Post-Import Verification

After import, verify:
1. Document count matches expected
2. Indexes are used in queries
3. Data types are correct
4. No null values in required fields