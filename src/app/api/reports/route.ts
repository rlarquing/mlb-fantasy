import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener reportes (solo admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const status = searchParams.get('status'); // pending, reviewed, resolved, dismissed
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const where = status ? { status } : {};
    
    const reports = await db.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Error fetching reports' }, { status: 500 });
  }
}

// POST - Crear reporte
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reporterId, reportedUserId, reason, description } = body;
    
    // Verificar que el usuario reportado existe
    const reportedUser = await db.user.findUnique({ where: { id: reportedUserId } });
    if (!reportedUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    // Verificar que no sea auto-reporte
    if (reporterId === reportedUserId) {
      return NextResponse.json({ error: 'No puedes reportarte a ti mismo' }, { status: 400 });
    }
    
    // Verificar que no exista un reporte reciente del mismo usuario
    const recentReport = await db.report.findFirst({
      where: {
        reporterId,
        reportedUserId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      }
    });
    
    if (recentReport) {
      return NextResponse.json({ error: 'Ya reportaste a este usuario recientemente' }, { status: 400 });
    }
    
    // Crear reporte
    const report = await db.report.create({
      data: {
        reporterId,
        reportedUserId,
        reason,
        description
      }
    });
    
    // Notificar a los admins
    const admins = await db.user.findMany({ where: { role: 'admin' } });
    
    for (const admin of admins) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: 'report_received',
          title: '📝 Nuevo reporte recibido',
          message: `Un usuario ha sido reportado por: ${reason}`,
          data: JSON.stringify({ reportId: report.id, reporterId, reportedUserId })
        }
      });
    }
    
    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json({ error: 'Error creating report' }, { status: 500 });
  }
}

// PATCH - Actualizar estado del reporte (solo admin)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminId, reportId, status, resolution } = body;
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const updateData: Record<string, unknown> = {
      status,
      reviewedBy: adminId,
      reviewedAt: new Date()
    };
    
    if (resolution) {
      updateData.resolution = resolution;
    }
    
    const report = await db.report.update({
      where: { id: reportId },
      data: updateData
    });
    
    // Si el reporte fue resuelto como "trampa confirmada", tomar acción
    if (status === 'resolved') {
      const reportWithUsers = await db.report.findUnique({
        where: { id: reportId },
        include: { reportedUser: true, reporter: true }
      });
      
      if (reportWithUsers) {
        // Notificar al usuario reportado
        await db.notification.create({
          data: {
            userId: reportWithUsers.reportedUserId,
            type: 'warning',
            title: '⚠️ Advertencia',
            message: 'Tu cuenta ha recibido una advertencia por comportamiento inadecuado.',
            data: JSON.stringify({ reportId, reason: reportWithUsers.reason })
          }
        });
        
        // Notificar al reportador
        await db.notification.create({
          data: {
            userId: reportWithUsers.reporterId,
            type: 'info',
            title: '✅ Reporte resuelto',
            message: 'Tu reporte ha sido revisado y resuelto. ¡Gracias por ayudar a mantener la comunidad!',
            data: JSON.stringify({ reportId })
          }
        });
      }
    }
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json({ error: 'Error updating report' }, { status: 500 });
  }
}
