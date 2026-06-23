'use server'

import { CheckInService, CheckInPayload } from '@/services/checkin.service'

export async function processCheckIn(gymId: string, payload: CheckInPayload) {
  return await CheckInService.process(gymId, payload)
}
