import { NextResponse } from 'next/server'
import { WalletService } from '@/services/wallet.service'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 })
  }

  const subscriptions = await WalletService.getAthleteSubscriptions(userId)
  return NextResponse.json({ success: true, data: subscriptions }, { status: 200 })
}
