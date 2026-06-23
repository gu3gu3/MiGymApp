'use server'

import { GamificationService, BroadcastInput } from '@/services/gamification.service'

export async function launchCompetitionBroadcast(data: BroadcastInput) {
  return await GamificationService.launchCompetition(data)
}
