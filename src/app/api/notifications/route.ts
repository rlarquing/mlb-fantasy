import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener notificaciones del usuario
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    const where = { userId, ...(unreadOnly && { read: false }) };
    
    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    const unreadCount = await db.notification.count({
      where: { userId, read: false }
    });
    
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error fetching notifications' }, { status: 500 });
  }
}

// PATCH - Marcar como leída
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { userId, notificationIds, markAllRead } = body;
    
    if (markAllRead) {
      await db.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
      });
    } else if (notificationIds && notificationIds.length > 0) {
      await db.notification.updateMany({
        where: { id: { in: notificationIds }, userId },
        data: { read: true }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Error updating notifications' }, { status: 500 });
  }
}

// POST - Crear notificación (para admin/sistema)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminId, userId, type, title, message, data } = body;
    
    // Verificar permisos
    if (adminId) {
      const admin = await db.user.findUnique({ where: { id: adminId } });
      if (!admin || admin.role !== 'admin') {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
    }
    
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data ? JSON.stringify(data) : null
      }
    });
    
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Error creating notification' }, { status: 500 });
  }
}
