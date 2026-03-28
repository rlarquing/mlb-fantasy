import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener rankings de usuarios
export async function GET() {
  try {
    const users = await db.user.findMany({
      orderBy: {
        totalPoints: 'desc'
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        totalPoints: true,
      }
    });
    
    const rankings = users.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
    
    return NextResponse.json(rankings);
  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json({ error: 'Error fetching rankings' }, { status: 500 });
  }
}
