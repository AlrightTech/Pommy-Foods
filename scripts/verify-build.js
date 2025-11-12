#!/usr/bin/env node

/**
 * Build Verification Script
 * Checks for common issues before building
 */

const fs = require('fs');
const path = require('path');

const errors = [];
const warnings = [];

// Check if required files exist
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.js',
  'app/layout.tsx',
  'app/page.tsx',
  'app/globals.css',
];

console.log('🔍 Verifying build prerequisites...\n');

// Check required files
requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    errors.push(`Missing required file: ${file}`);
  }
});

// Check package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    'react',
    'react-dom',
    'next',
    '@supabase/supabase-js',
    'clsx',
    'tailwind-merge',
  ];
  
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
      errors.push(`Missing dependency: ${dep}`);
    }
  });
  
  if (!packageJson.scripts.build) {
    errors.push('Missing build script in package.json');
  }
} catch (e) {
  errors.push(`Error reading package.json: ${e.message}`);
}

// Check TypeScript config
try {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (!tsConfig.compilerOptions.paths || !tsConfig.compilerOptions.paths['@/*']) {
    warnings.push('Path alias @/* might not be configured correctly');
  }
} catch (e) {
  warnings.push(`Could not verify tsconfig.json: ${e.message}`);
}

// Check for .env.example
if (!fs.existsSync('env.example') && !fs.existsSync('.env.example')) {
  warnings.push('No .env.example file found (recommended for documentation)');
}

// Report results
console.log('📊 Verification Results:\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Ready to build.\n');
  process.exit(0);
}

if (warnings.length > 0) {
  console.log('⚠️  Warnings:');
  warnings.forEach(warning => console.log(`   - ${warning}`));
  console.log('');
}

if (errors.length > 0) {
  console.log('❌ Errors found:');
  errors.forEach(error => console.log(`   - ${error}`));
  console.log('\n❌ Build verification failed. Please fix the errors above.\n');
  process.exit(1);
}

console.log('✅ Build verification completed with warnings.\n');
process.exit(0);

