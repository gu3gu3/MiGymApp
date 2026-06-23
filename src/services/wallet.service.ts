import { prisma } from "@/lib/prisma";

export const WalletService = {
  async getAthleteSubscriptions(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        gym: { select: { name: true, logoUrl: true, bannerUrl: true, teamColor: true } },
        plan: { select: { name: true } }
      }
    });

    return subscriptions.map(sub => ({
      id: sub.id,
      gymName: sub.gym.name,
      gymLogo: sub.gym.logoUrl || sub.gym.name.substring(0, 2).toUpperCase(),
      gymBanner: sub.gym.bannerUrl || null,
      status: sub.status,
      planName: sub.plan.name,
      offlineToken: sub.offlineToken,
      themeColor: sub.gym.teamColor || "from-slate-900 to-slate-800"
    }));
  }
};
