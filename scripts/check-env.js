/**
 * Quick script to verify environment variables are loaded
 * Run with: node scripts/check-env.js
 */

require('dotenv').config({ path: '.env.local' })

const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NODE_ENV'
]

console.log('🔍 Checking environment variables...\n')

let allPresent = true

requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('SECRET') || varName === 'DATABASE_URL'
      ? value.substring(0, 20) + '...' 
      : value
    console.log(`✅ ${varName}: ${displayValue}`)
  } else {
    console.log(`❌ ${varName}: NOT FOUND`)
    allPresent = false
  }
})

console.log('\n' + '='.repeat(50))

if (allPresent) {
  console.log('✅ All required environment variables are present!')
  process.exit(0)
} else {
  console.log('❌ Some environment variables are missing!')
  console.log('\nMake sure .env.local exists in the project root with all required variables.')
  process.exit(1)
}

