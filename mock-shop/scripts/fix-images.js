const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const mappings = [
    {
      name: 'Wireless Headphones',
      images: JSON.stringify([
        '/images/wireless-headphone/wireless-headphone.webp'
      ])
    },
    {
      name: 'Smartphone',
      images: JSON.stringify([
        '/images/smartphone/smartphone.webp'
      ])
    },
    {
      name: 'T-Shirt',
      images: JSON.stringify([
        '/images/tshirt1/tshirt.webp',
        '/images/tshirt2/tshirt.webp',
        '/images/tshirt3/tshirt.webp',
        '/images/tshirt4/tshirt.webp'
      ])
    }
  ]

  for (const m of mappings) {
    await prisma.product.updateMany({
      where: { name: m.name },
      data: { images: m.images }
    })
  }

  const updated = await prisma.product.findMany({
    select: { name: true, images: true }
  })
  console.log('Updated product images:', updated)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


