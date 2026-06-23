import { prisma } from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('Seeding Super Admin user...')

  const email = 'amorales@websavvy-solutions.com'
  const rawPassword = 'SuperAdmin!2026'
  const hashedPassword = await bcrypt.hash(rawPassword, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    },
    create: {
      name: 'Moises Morales (Super Admin)',
      email,
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  })

  console.log(`Upserted super admin: ${user.email} / Password: ${rawPassword}`)
  console.log('Finished seeding Super Admin.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
