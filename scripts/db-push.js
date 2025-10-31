/**
 * Helper script to run Prisma db push with .env.local loaded
 * Run with: node scripts/db-push.js
 */

require('dotenv').config({ path: '.env.local' })

const { execSync } = require('child_process')

console.log('🚀 Pushing database schema to Supabase...\n')

try {
  // Set environment variables for the command
  const env = {
    ...process.env,
    DATABASE_URL: process.env.DATABASE_URL,
  }

  // Run prisma db push
  execSync('npx prisma db push', {
    stdio: 'inherit',
    env: env,
    cwd: process.cwd(),
  })

  console.log('\n✅ Database schema pushed successfully!')
} catch (error) {
  console.error('\n❌ Error pushing database schema:', error.message)
  process.exit(1)
}

