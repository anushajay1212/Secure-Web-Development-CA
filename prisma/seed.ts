import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const adminEmail = 'admin@university.edu'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists, skipping...')
    return
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 12)

  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Mitchell',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      profile: {
        create: {
          studentId: null,
        },
      },
    },
  })

  console.log('✅ Admin user created successfully!')
  console.log('📧 Email:', adminEmail)
  console.log('🔑 Password: Admin@123')
  console.log('')
  console.log('⚠️  IMPORTANT: Please change this password after first login!')
  console.log('')
  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

