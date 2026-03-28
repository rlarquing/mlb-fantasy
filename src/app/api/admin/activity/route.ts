import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener logs de actividad
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const userId = searchParams.get('userId'); // Para ver actividad de un usuario específico
    const limit = parseInt(searchParams.get('limit') || '100');
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const where = userId ? { userId } : {};
    
    const logs = await db.activityLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json({ error: 'Error fetching activity logs' }, { status: 500 });
  }
}

// POST - Registrar actividad
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, details } = body;
    
    const log = await db.activityLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.stringify(details) : null
      }
    });
    
    return NextResponse.json(log);
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json({ error: 'Error creating activity log' }, { status: 500 });
  }
}
