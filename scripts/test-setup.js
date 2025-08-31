#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Growth Measurement Review Agent setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.ts',
  'tsconfig.json',
  'app/layout.tsx',
  'app/globals.css',
  'lib/types.ts',
  'lib/store/wizard.ts',
  'components/Stepper.tsx',
  'app/(wizard)/page.tsx',
  'app/api/upload/route.ts',
  'app/api/analyze/seo/route.ts',
  'app/api/export/pdf/route.ts',
  'README.md'
];

let allFilesExist = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check if .env.local exists
console.log('\n🔑 Checking environment setup:');
if (fs.existsSync('.env.local')) {
  console.log('  ✅ .env.local exists');
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (envContent.includes('OPENAI_API_KEY=')) {
    console.log('  ✅ OPENAI_API_KEY is configured');
  } else {
    console.log('  ⚠️  OPENAI_API_KEY not found in .env.local');
  }
} else {
  console.log('  ❌ .env.local not found - copy from env.example');
}

// Check if node_modules exists
console.log('\n📦 Checking dependencies:');
if (fs.existsSync('node_modules')) {
  console.log('  ✅ node_modules exists');
} else {
  console.log('  ❌ node_modules not found - run "pnpm install"');
  allFilesExist = false;
}

// Check example files
console.log('\n📄 Checking example files:');
const exampleFiles = [
  'examples/screaming-frog-sample.csv',
  'examples/ahrefs-sample.csv'
];

exampleFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 Setup looks good! You can now run:');
  console.log('   pnpm dev');
  console.log('\n📖 See README.md for detailed instructions');
} else {
  console.log('⚠️  Some files are missing. Please check the errors above.');
  console.log('\n📖 See README.md for setup instructions');
}

console.log('\n🚀 Happy analyzing!');


