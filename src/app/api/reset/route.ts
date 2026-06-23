import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const hash = await bcrypt.hash('123456', 10);
    
    await prisma.user.updateMany({
      data: { password: hash }
    });
    
    return NextResponse.json({ success: true, message: 'All passwords reset to 123456' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
