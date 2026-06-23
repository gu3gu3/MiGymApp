import { NextResponse } from 'next/server'
import { CheckInService } from '@/services/checkin.service'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { gymId, payload } = body
    
    if (!gymId || !payload) {
      return NextResponse.json({ success: false, error: 'Missing gymId or payload' }, { status: 400 })
    }

    const result = await CheckInService.process(gymId, payload)
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }
    
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
