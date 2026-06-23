import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export interface CheckInPayload {
  token: string;
  isOfflineBatch: boolean;
  scannedAt?: Date;
}

export const CheckInService = {
  async process(gymId: string, payload: CheckInPayload) {
    let userId: string;
    let subscriptionId: string;
    let isOfflineSync = payload.isOfflineBatch;

    try {
      if (payload.isOfflineBatch || payload.token.includes('.')) { 
        const decoded = jwt.verify(payload.token, process.env.JWT_OFFLINE_SECRET!) as any;
        if (decoded.gymId !== gymId) {
          return { success: false, error: 'Este pase pertenece a otro gimnasio.' };
        }
        userId = decoded.userId;
        subscriptionId = decoded.subId;
      } else {
        const sub = await prisma.subscription.findUnique({
          where: { id: payload.token },
          include: { plan: true }
        });

        if (!sub || sub.gymId !== gymId || sub.status !== 'ACTIVE') {
          return { success: false, error: 'Suscripción inválida o vencida.' };
        }
        if (sub.remainingTotal != null && sub.remainingTotal <= 0) {
          return { success: false, error: 'Sin créditos disponibles.' };
        }
        userId = sub.userId;
        subscriptionId = sub.id;
      }

      await prisma.$transaction(async (tx) => {
        await tx.checkIn.create({
          data: {
            gymId,
            userId,
            subscriptionId,
            isOfflineSync,
            createdAt: payload.scannedAt || new Date()
          }
        });

        if (!isOfflineSync) {
          const sub = await tx.subscription.findUnique({ where: { id: subscriptionId } });
          if (sub && sub.remainingTotal != null && sub.remainingTotal > 0) {
            await tx.subscription.update({
              where: { id: subscriptionId },
              data: { remainingTotal: { decrement: 1 } }
            });
          }
        }

        await tx.user.update({
          where: { id: userId },
          data: { xp: { increment: 50 } }
        });

        const activeCompetitions = await tx.gymInCompetition.findMany({
          where: {
            gymId,
            isConfirmed: true,
            competition: {
              status: 'ACTIVE',
              startDate: { lte: new Date() },
              endDate: { gte: new Date() }
            }
          }
        });

        for (const comp of activeCompetitions) {
          await tx.gymInCompetition.update({
            where: { id: comp.id },
            data: { score: { increment: 10 } }
          });
        }
      });

      return { success: true, message: 'Check-in procesado exitosamente.' };
    } catch (error) {
      return { success: false, error: 'Token inválido o expirado.' };
    }
  }
};
