const { PrismaClient } = require('@prisma/client')
const fs = require('fs')

const prisma = new PrismaClient()

async function dump() {
  const plans = await prisma.platformPlan.findMany()
  const gyms = await prisma.gym.findMany()
  const users = await prisma.user.findMany()
  const gymPlans = await prisma.plan.findMany()
  const subscriptions = await prisma.subscription.findMany()

  const data = {
    plans,
    gyms,
    users,
    gymPlans,
    subscriptions
  }

  fs.writeFileSync('db-dump.json', JSON.stringify(data, null, 2))
  console.log('Data dumped to db-dump.json')
}

dump().finally(() => prisma.$disconnect())
