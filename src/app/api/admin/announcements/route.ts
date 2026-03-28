import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener anuncios
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    // Si es admin, puede ver todos, si no, solo activos
    let admin = null;
    if (adminId) {
      admin = await db.user.findUnique({ where: { id: adminId } });
    }
    
    const where = (admin?.role === 'admin' && !activeOnly) ? {} : { active: true };
    
    const announcements = await db.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json({ error: 'Error fetching announcements' }, { status: 500 });
  }
}

// POST - Crear anuncio (solo admin)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminId, title, content, type } = body;
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        type: type || 'info'
      }
    });
    
    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: adminId,
        action: 'admin_create_announcement',
        details: JSON.stringify({ announcementId: announcement.id, title })
      }
    });
    
    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Error creating announcement' }, { status: 500 });
  }
}

// PATCH - Actualizar/Desactivar anuncio
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminId, announcementId, title, content, type, active } = body;
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (active !== undefined) updateData.active = active;
    
    const announcement = await db.announcement.update({
      where: { id: announcementId },
      data: updateData
    });
    
    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error updating announcement:', error);
    return NextResponse.json({ error: 'Error updating announcement' }, { status: 500 });
  }
}

// DELETE - Eliminar anuncio
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const announcementId = searchParams.get('announcementId');
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    await db.announcement.delete({ where: { id: announcementId || '' } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json({ error: 'Error deleting announcement' }, { status: 500 });
  }
}
