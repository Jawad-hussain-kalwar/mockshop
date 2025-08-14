const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDiscounts() {
  try {
    const discounts = await prisma.discountCode.findMany()
    console.log('Discount codes in database:')
    discounts.forEach(discount => {
      console.log(`- Code: ${discount.code}`)
      console.log(`  Type: ${discount.type}`)
      console.log(`  Value: ${discount.value}`)
      console.log(`  Active: ${discount.isActive}`)
      console.log(`  Expires: ${discount.expiresAt}`)
      console.log(`  Min Order: ${discount.minOrderAmount}`)
      console.log(`  Uses: ${discount.currentUses}/${discount.maxUses}`)
      console.log('---')
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDiscounts()