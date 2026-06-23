import { prisma } from '../src/lib/prisma'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log('Seeding Database from Official MVP Baseline...')
  
  const dumpPath = path.join(__dirname, 'db-dump.json')
  if (!fs.existsSync(dumpPath)) {
    console.error('No db-dump.json found. Skipping seed.')
    return
  }

  const data = JSON.parse(fs.readFileSync(dumpPath, 'utf8'))

  // We must seed in correct dependency order to avoid foreign key violations.
  // 1. PlatformPlans
  if (data.platformPlans) {
    for (const plan of data.platformPlans) {
      await prisma.platformPlan.upsert({
        where: { id: plan.id },
        update: plan,
        create: plan
      })
    }
    console.log(`Seeded ${data.platformPlans.length} Platform Plans.`)
  }

  // 2. Gyms
  if (data.gyms) {
    for (const gym of data.gyms) {
      await prisma.gym.upsert({
        where: { id: gym.id },
        update: gym,
        create: gym
      })
    }
    console.log(`Seeded ${data.gyms.length} Gyms.`)
  }

  // 3. Users
  if (data.users) {
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      })
    }
    console.log(`Seeded ${data.users.length} Users.`)
  }

  // 4. Plans
  if (data.plans) {
    for (const plan of data.plans) {
      await prisma.plan.upsert({
        where: { id: plan.id },
        update: plan,
        create: plan
      })
    }
    console.log(`Seeded ${data.plans.length} Gym Plans.`)
  }

  // 5. Subscriptions
  if (data.subscriptions) {
    for (const sub of data.subscriptions) {
      await prisma.subscription.upsert({
        where: { id: sub.id },
        update: sub,
        create: sub
      })
    }
    console.log(`Seeded ${data.subscriptions.length} Subscriptions.`)
  }

  console.log('Finished seeding MVP Baseline.')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
