/**
 * Database Seed Script
 * Run with: npx ts-node scripts/seed.ts
 * 
 * Creates initial admin user for first-time setup
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create default admin user
  const adminEmail = 'admin@pommyfoods.com'
  const adminPassword = 'Admin@123' // Change this in production!
  
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('Admin user already exists')
    return
  }

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('✅ Created admin user:')
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log('\n⚠️  IMPORTANT: Change the default password after first login!')

  console.log('\nSeed completed!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

