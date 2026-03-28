import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todos los usuarios (solo admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        totalPoints: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: { predictions: true, sentMessages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Error fetching users' }, { status: 500 });
  }
}

// PATCH - Actualizar usuario (rol, estado, puntos)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminId, userId, action, value } = body;
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    let updateData: Record<string, unknown> = {};
    
    switch (action) {
      case 'setRole':
        updateData.role = value; // 'admin' o 'user'
        break;
      case 'setStatus':
        updateData.status = value; // 'active', 'banned', 'suspended'
        break;
      case 'setPoints':
        updateData.totalPoints = parseInt(value);
        break;
      case 'resetPoints':
        updateData.totalPoints = 0;
        break;
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
    
    const user = await db.user.update({
      where: { id: userId },
      data: updateData
    });
    
    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: adminId,
        action: `admin_${action}`,
        details: JSON.stringify({ targetUserId: userId, value })
      }
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Error updating user' }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const userId = searchParams.get('userId');
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Eliminar predicciones del usuario
    await db.prediction.deleteMany({ where: { userId: userId || '' } });
    
    // Eliminar mensajes del usuario
    await db.message.deleteMany({ where: { senderId: userId || '' } });
    
    // Eliminar usuario
    await db.user.delete({ where: { id: userId || '' } });
    
    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: adminId || '',
        action: 'admin_delete_user',
        details: JSON.stringify({ deletedUserId: userId })
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
  }
}
