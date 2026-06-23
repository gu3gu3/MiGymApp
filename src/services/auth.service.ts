import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const AuthService = {
  async generateOfflineToken(userId: string, gymId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        gymId,
        status: 'ACTIVE',
      },
      include: {
        user: { select: { name: true, image: true } }
      }
    });

    if (!subscription) {
      throw new Error('No posees una suscripción activa en este gimnasio.');
    }

    const payload = {
      subId: subscription.id,
      userId: subscription.userId,
      gymId: subscription.gymId,
      userName: subscription.user.name,
      userPhoto: subscription.user.image,
      endDate: subscription.endDate,
      remainingTotal: subscription.remainingTotal,
      type: subscription.offlineToken
    };

    const offlineToken = jwt.sign(payload, process.env.JWT_OFFLINE_SECRET!, { expiresIn: '3d' });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { offlineToken }
    });

    return { offlineToken };
  }
};
