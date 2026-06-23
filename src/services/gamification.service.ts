import { prisma } from "@/lib/prisma";

export interface BroadcastInput {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  sponsorId?: string;
}

export const GamificationService = {
  async launchCompetition(data: BroadcastInput) {
    const newCompetition = await prisma.competition.create({
      data: {
        ...data,
        status: 'BROADCASTING'
      }
    });

    const allGyms = await prisma.gym.findMany({ select: { id: true } });

    const broadcastRecords = allGyms.map(gym => ({
      gymId: gym.id,
      competitionId: newCompetition.id,
      isConfirmed: false,
      score: 0
    }));

    await prisma.gymInCompetition.createMany({
      data: broadcastRecords
    });

    return { success: true, competitionId: newCompetition.id };
  },

  async getLeaderboard(competitionId: string) {
    return prisma.gymInCompetition.findMany({
      where: { competitionId, isConfirmed: true },
      include: { gym: { select: { name: true, logoUrl: true, teamColor: true } } },
      orderBy: { score: 'desc' }
    });
  }
};
