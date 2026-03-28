import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener usuario actual (simulado)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId }
      });
      return NextResponse.json(user);
    }
    
    // Obtener el primer usuario o crear uno
    let user = await db.user.findFirst({
      orderBy: { createdAt: 'asc' }
    });
    
    if (!user) {
      // Crear el primer usuario como ADMIN
      user = await db.user.create({
        data: {
          name: 'Admin',
          email: 'admin@mlbfantasy.com',
          totalPoints: 0,
          role: 'admin',
          status: 'active'
        }
      });
      
      // Registrar actividad
      await db.activityLog.create({
        data: {
          userId: user.id,
          action: 'user_created_admin'
        }
      });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
  }
}

// POST - Crear/Actualizar usuario
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, userId } = body;
    
    if (userId) {
      // Actualizar usuario existente
      const user = await db.user.update({
        where: { id: userId },
        data: { name, email }
      });
      return NextResponse.json(user);
    }
    
    // Crear nuevo usuario
    const existingUser = await db.user.findFirst();
    const isFirstUser = !existingUser;
    
    const user = await db.user.create({
      data: {
        name,
        email,
        totalPoints: 0,
        role: isFirstUser ? 'admin' : 'user',
        status: 'active'
      }
    });
    
    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: user.id,
        action: 'user_created',
        details: JSON.stringify({ name, email })
      }
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
  }
}
