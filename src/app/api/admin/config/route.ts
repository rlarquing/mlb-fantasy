import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener configuración
export async function GET() {
  try {
    const configs = await db.gameConfig.findMany();
    
    // Convertir a objeto
    const configObj: Record<string, string> = {};
    configs.forEach(c => {
      configObj[c.key] = c.value;
    });
    
    return NextResponse.json(configObj);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json({ error: 'Error fetching config' }, { status: 500 });
  }
}

// PATCH - Actualizar configuración (solo admin)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminId, configs } = body;
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Actualizar cada configuración
    for (const [key, value] of Object.entries(configs)) {
      await db.gameConfig.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      });
    }
    
    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: adminId,
        action: 'admin_update_config',
        details: JSON.stringify(configs)
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json({ error: 'Error updating config' }, { status: 500 });
  }
}
