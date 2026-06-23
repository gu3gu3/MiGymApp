const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding SaaS Platform Plans...')

  const plans = [
    {
      name: 'Gratuito / Pilot',
      maxAthletes: 25,
      priceNio: 0,
      priceUsd: 0,
    },
    {
      name: 'Starter',
      maxAthletes: 150,
      priceNio: 29 * 36.5, // Approx exchange rate if needed, or just keep USD value, wait user specified $29 for NIC and $39 for CA
      // The user spec: 
      // Starter: $29 (NIC), $39 (CA)
      priceNio: 29, 
      priceUsd: 39,
    },
    {
      name: 'Growth',
      maxAthletes: 500,
      priceNio: 59,
      priceUsd: 79,
    },
    {
      name: 'Pro / Scale',
      maxAthletes: 1000,
      priceNio: 99,
      priceUsd: 129,
    },
    {
      name: 'Enterprise / Multi-sede',
      maxAthletes: null, // Unlimited
      priceNio: 0, // Custom
      priceUsd: 0, // Custom
      isCustom: true
    }
  ]

  for (const plan of plans) {
    await prisma.platformPlan.create({
      data: plan
    })
    console.log(`Created plan: ${plan.name}`)
  }

  console.log('Finished seeding.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
