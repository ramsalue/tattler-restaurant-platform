// scripts/codeQualityCheck.js
const fs = require('fs');
const path = require('path');

console.log(' Code Quality Check\n');

const checks = {
  passed: [],
  warnings: [],
  failed: []
};

// Check 1: Environment variables
console.log(' Checking environment configuration...');
if (fs.existsSync('.env')) {
  checks.passed.push(' .env file exists');
} else {
  checks.failed.push(' .env file missing');
}

if (fs.existsSync('.env.example')) {
  checks.passed.push(' .env.example file exists');
} else {
  checks.warnings.push('  .env.example file missing');
}

// Check 2: Required files
console.log('Checking required files...');
const requiredFiles = [
  'package.json',
  'README.md',
  '.gitignore',
  'src/server.js',
  'src/config/database.js',
  'src/controllers/restaurantController.js',
  'src/routes/restaurantRoutes.js',
  'src/middleware/errorHandler.js',
  'src/middleware/validators.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.passed.push(` ${file} exists`);
  } else {
    checks.failed.push(` ${file} missing`);
  }
});

// Check 3: Documentation files
console.log(' Checking documentation...');
const docFiles = [
  'docs/API_DOCUMENTATION.md',
  'docs/SPRINT3_SUMMARY.md',
  'docs/SPRINT3_FEATURES.md',
  'docs/PERFORMANCE_REPORT.md'
];

docFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checks.passed.push(` ${file} exists`);
  } else {
    checks.warnings.push(`  ${file} missing`);
  }
});

// Check 4: package.json version
console.log('  Checking version...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
if (packageJson.version === '2.1.0') {
  checks.passed.push(' Version is 2.1.0');
} else {
  checks.warnings.push(`  Version is ${packageJson.version}, expected 2.1.0`);
}

// Check 5: No console.logs in production code
console.log('  Checking for console.logs...');
const srcFiles = getAllFiles('src', '.js');
let consoleLogsFound = 0;

srcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/console\.log/g);
  if (matches) {
    consoleLogsFound += matches.length;
  }
});

if (consoleLogsFound === 0) {
  checks.passed.push(' No console.logs in src/');
} else {
  checks.warnings.push(`  Found ${consoleLogsFound} console.log(s) in src/ - consider removing for production`);
}

// Check 6: .gitignore
console.log('  Checking .gitignore...');
const gitignore = fs.readFileSync('.gitignore', 'utf8');
const requiredIgnores = ['node_modules', '.env', '*.log'];
requiredIgnores.forEach(pattern => {
  if (gitignore.includes(pattern)) {
    checks.passed.push(` .gitignore includes ${pattern}`);
  } else {
    checks.failed.push(` .gitignore missing ${pattern}`);
  }
});

// Print results
console.log('\n' + '='.repeat(70));
console.log('\n Quality Check Results:\n');

if (checks.passed.length > 0) {
  console.log(' PASSED:');
  checks.passed.forEach(check => console.log(`   ${check}`));
}

if (checks.warnings.length > 0) {
  console.log('\n  WARNINGS:');
  checks.warnings.forEach(check => console.log(`   ${check}`));
}

if (checks.failed.length > 0) {
  console.log('\n FAILED:');
  checks.failed.forEach(check => console.log(`   ${check}`));
}

console.log('\n' + '='.repeat(70));

const totalChecks = checks.passed.length + checks.warnings.length + checks.failed.length;
const passRate = ((checks.passed.length / totalChecks) * 100).toFixed(1);

console.log(`\nTotal Checks: ${totalChecks}`);
console.log(`Passed: ${checks.passed.length} (${passRate}%)`);
console.log(`Warnings: ${checks.warnings.length}`);
console.log(`Failed: ${checks.failed.length}`);

if (checks.failed.length === 0) {
  console.log('\n Code quality check passed!\n');
} else {
  console.log('\n  Please fix failed checks before submission.\n');
}

// Helper function
function getAllFiles(dirPath, extension, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, extension, arrayOfFiles);
    } else if (filePath.endsWith(extension)) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}