const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { gym: { include: { platformPlan: true } } }
  });
  console.log("Users and their Gyms:");
  users.forEach(u => {
    console.log(`User: ${u.email}, Gym: ${u.gym?.name} (Slug: ${u.gym?.slug}), Plan: ${u.gym?.platformPlan?.name}`);
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
