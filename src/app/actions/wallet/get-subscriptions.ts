'use server'

import { WalletService } from '@/services/wallet.service'

export async function getMySubscriptions(userId: string) {
  // En una integración completa, aquí sacaríamos el ID de la sesión segura
  // import { auth } from '@/auth'
  // const session = await auth()
  // const id = session?.user?.id || userId
  return await WalletService.getAthleteSubscriptions(userId)
}
