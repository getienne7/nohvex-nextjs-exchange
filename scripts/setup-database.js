#!/usr/bin/env node

/**
 * Database Setup Script for NOHVEX Exchange
 * This script helps set up a production PostgreSQL database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🗄️  NOHVEX Exchange - Database Setup\n');

// Check if we're in the right directory
if (!fs.existsSync('prisma/schema.prisma')) {
  console.error('❌ Error: Please run this script from the project root directory');
  process.exit(1);
}

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log('⚠️  DATABASE_URL not found in environment variables');
  console.log('\n📋 Next Steps:');
  console.log('1. Set up a PostgreSQL database (recommended: Neon, Supabase, or Vercel Postgres)');
  console.log('2. Add DATABASE_URL to your .env file');
  console.log('3. Run this script again');
  console.log('\n🔗 Quick Setup Options:');
  console.log('• Neon (Free): https://console.neon.tech/');
  console.log('• Supabase (Free): https://supabase.com/dashboard');
  console.log('• Vercel Postgres: https://vercel.com/dashboard');
  process.exit(1);
}

console.log('✅ DATABASE_URL found');
console.log(`📍 Database: ${databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown'}`);

try {
  console.log('\n🔄 Step 1: Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('\n🔄 Step 2: Pushing database schema...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('\n🔄 Step 3: Seeding demo data...');
  // Check if seed script exists
  if (fs.existsSync('prisma/seed.js') || fs.existsSync('prisma/seed.ts')) {
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Seeding failed, but database setup is complete');
    }
  } else {
    console.log('ℹ️  No seed script found, skipping demo data');
  }
  
  console.log('\n🎉 Database setup completed successfully!');
  console.log('\n📊 Next Steps:');
  console.log('1. Update your Vercel environment variables with the same DATABASE_URL');
  console.log('2. Deploy to production: vercel --prod');
  console.log('3. Test user registration and login');
  
  console.log('\n🔍 Verify Setup:');
  console.log('• Local: npm run dev');
  console.log('• Production: https://nohvex-nextjs-exchange.vercel.app');
  console.log('• Database Studio: npx prisma studio');
  
} catch (error) {
  console.error('\n❌ Database setup failed:');
  console.error(error.message);
  
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your DATABASE_URL is correct');
  console.log('2. Ensure the database server is accessible');
  console.log('3. Verify your database credentials');
  console.log('4. Check network connectivity');
  
  process.exit(1);
}