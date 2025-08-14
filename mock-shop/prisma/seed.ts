import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  
  // Clear existing data
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  await prisma.discountCode.deleteMany()

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      description: 'Latest gadgets and tech',
      slug: 'electronics',
    },
  })

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      description: 'Fashion for everyone',
      slug: 'clothing',
    },
  })

  const home = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      description: 'Everything for your home',
      slug: 'home',
    },
  })

  // Create sample products
  const products = [
    {
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      categoryId: electronics.id,
      stockQuantity: 50,
      images: JSON.stringify(['/images/wireless-headphone/wireless-headphone.webp']),
    },
    {
      name: 'Smartphone',
      description: 'Latest smartphone with advanced features',
      price: 699.99,
      categoryId: electronics.id,
      stockQuantity: 30,
      images: JSON.stringify(['/images/smartphone/smartphone.webp']),
    },
    {
      name: 'T-Shirt',
      description: 'Comfortable cotton t-shirt',
      price: 29.99,
      categoryId: clothing.id,
      stockQuantity: 100,
      images: JSON.stringify([
        '/images/tshirt1/tshirt.webp',
        '/images/tshirt2/tshirt.webp',
        '/images/tshirt3/tshirt.webp',
        '/images/tshirt4/tshirt.webp'
      ]),
    },
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mockshop.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  })

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@mockshop.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
    },
  })

  // Create discount codes
  await prisma.discountCode.create({
    data: {
      code: 'WELCOME10',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 50,
      maxUses: 100,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  await prisma.discountCode.create({
    data: {
      code: 'SAVE20',
      type: 'FIXED',
      value: 20,
      minOrderAmount: 100,
      maxUses: 50,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  })

  await prisma.discountCode.create({
    data: {
      code: 'TESTCODE20',
      type: 'PERCENTAGE',
      value: 20,
      minOrderAmount: 0,
      maxUses: null, // Unlimited
      expiresAt: null, // No expiration
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('📧 Test accounts:')
  console.log('   Admin: admin@mockshop.com / password123')
  console.log('   Customer: customer@mockshop.com / password123')
}

console.log('Starting seed script...')

main()
  .then(() => {
    console.log('Seed script completed successfully')
  })
  .catch((e) => {
    console.error('Seed script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    console.log('Disconnecting from database...')
    await prisma.$disconnect()
  })