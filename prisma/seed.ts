const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')
  // We don't add real media paths here because they wouldn't exist on the filesystem
  // But we could add placeholder entries if needed.
  // For now, we leave it empty so the user can add their own nades.
  console.log('Database is ready for use.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
