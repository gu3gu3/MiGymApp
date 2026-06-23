'use server'

import { AuthService } from '@/services/auth.service'

export async function generateOfflineToken(userId: string, gymId: string) {
  return await AuthService.generateOfflineToken(userId, gymId)
}
