import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Tipos de detección de trampas
const CHEAT_TYPES = {
  RAPID_PREDICTIONS: 'rapid_predictions',        // Muchas predicciones en poco tiempo
  PATTERN_MATCHING: 'pattern_matching',          // Patrón sospechoso de predicciones
  SCORE_MANIPULATION: 'score_manipulation',      // Intento de manipular puntos
  UNUSUAL_TIMING: 'unusual_timing',              // Predicciones en horarios sospechosos
  HIGH_WIN_RATE: 'high_win_rate',               // Tasa de acierto inusualmente alta
  MULTIPLE_DEVICES: 'multiple_devices'          // Múltiples sesiones simultáneas
};

// Umbrales para detección
const THRESHOLDS = {
  RAPID_PREDICTIONS_COUNT: 10,          // Más de 10 predicciones en...
  RAPID_PREDICTIONS_MINUTES: 5,         // ...5 minutos
  HIGH_WIN_RATE_PERCENT: 80,            // Más del 80% de aciertos
  HIGH_WIN_RATE_MIN_PREDICTIONS: 20,   // Con al menos 20 predicciones
  SUSPICIOUS_TIME_START: 2,             // 2 AM
  SUSPICIOUS_TIME_END: 5                // 5 AM
};

// GET - Obtener alertas de trampas (solo admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const severity = searchParams.get('severity');
    const unresolved = searchParams.get('unresolved') === 'true';
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const where: Record<string, unknown> = {};
    if (severity) where.severity = severity;
    if (unresolved) where.resolved = false;
    
    const alerts = await db.cheatAlert.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error fetching cheat alerts:', error);
    return NextResponse.json({ error: 'Error fetching cheat alerts' }, { status: 500 });
  }
}

// POST - Analizar comportamiento y detectar trampas
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, action, data } = body;
    
    const alerts: Array<{ type: string; severity: string; description: string }> = [];
    
    // Obtener historial reciente del usuario
    const recentPredictions = await db.prediction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { game: true }
    });
    
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ alerts: [] });
    
    // --- Detección 1: Predicciones muy rápidas ---
    if (action === 'prediction') {
      const last5Minutes = new Date(Date.now() - THRESHOLDS.RAPID_PREDICTIONS_MINUTES * 60 * 1000);
      const recentCount = recentPredictions.filter(
        p => new Date(p.createdAt) > last5Minutes
      ).length;
      
      if (recentCount > THRESHOLDS.RAPID_PREDICTIONS_COUNT) {
        alerts.push({
          type: CHEAT_TYPES.RAPID_PREDICTIONS,
          severity: recentCount > 20 ? 'critical' : recentCount > 15 ? 'high' : 'medium',
          description: `${recentCount} predicciones en ${THRESHOLDS.RAPID_PREDICTIONS_MINUTES} minutos`
        });
      }
    }
    
    // --- Detección 2: Tasa de acierto muy alta ---
    const finishedPredictions = recentPredictions.filter(p => p.isCorrect !== null);
    if (finishedPredictions.length >= THRESHOLDS.HIGH_WIN_RATE_MIN_PREDICTIONS) {
      const correctCount = finishedPredictions.filter(p => p.isCorrect === true).length;
      const winRate = (correctCount / finishedPredictions.length) * 100;
      
      if (winRate >= THRESHOLDS.HIGH_WIN_RATE_PERCENT) {
        alerts.push({
          type: CHEAT_TYPES.HIGH_WIN_RATE,
          severity: winRate >= 90 ? 'critical' : winRate >= 85 ? 'high' : 'medium',
          description: `Tasa de acierto del ${winRate.toFixed(1)}% (${correctCount}/${finishedPredictions.length})`
        });
      }
    }
    
    // --- Detección 3: Horarios sospechosos ---
    if (action === 'prediction') {
      const hour = new Date().getHours();
      if (hour >= THRESHOLDS.SUSPICIOUS_TIME_START && hour <= THRESHOLDS.SUSPICIOUS_TIME_END) {
        alerts.push({
          type: CHEAT_TYPES.UNUSUAL_TIMING,
          severity: 'low',
          description: `Actividad a las ${hour}:00 (horario inusual)`
        });
      }
    }
    
    // Crear alertas en la base de datos
    const createdAlerts = [];
    for (const alert of alerts) {
      // Verificar si ya existe una alerta similar recientemente
      const existingAlert = await db.cheatAlert.findFirst({
        where: {
          userId,
          type: alert.type,
          resolved: false,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        }
      });
      
      if (!existingAlert) {
        const created = await db.cheatAlert.create({
          data: {
            userId,
            type: alert.type,
            severity: alert.severity,
            description: alert.description,
            data: JSON.stringify(data)
          }
        });
        createdAlerts.push(created);
        
        // Notificar a los admins
        const admins = await db.user.findMany({ where: { role: 'admin' } });
        for (const admin of admins) {
          await db.notification.create({
            data: {
              userId: admin.id,
              type: 'cheat_detected',
              title: `⚠️ Alerta de trampa (${alert.severity.toUpperCase()})`,
              message: `${user.name}: ${alert.description}`,
              data: JSON.stringify({ alertId: created.id, userId, type: alert.type })
            }
          });
        }
      }
    }
    
    return NextResponse.json({ alerts: createdAlerts });
  } catch (error) {
    console.error('Error detecting cheats:', error);
    return NextResponse.json({ error: 'Error detecting cheats' }, { status: 500 });
  }
}

// PATCH - Resolver alerta (solo admin)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminId, alertId, action } = body; // action: 'dismiss', 'warn', 'ban'
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const alert = await db.cheatAlert.findUnique({
      where: { id: alertId },
      include: { user: true }
    });
    
    if (!alert) {
      return NextResponse.json({ error: 'Alerta no encontrada' }, { status: 404 });
    }
    
    // Actualizar alerta
    await db.cheatAlert.update({
      where: { id: alertId },
      data: {
        resolved: true,
        resolvedBy: adminId,
        resolvedAt: new Date()
      }
    });
    
    // Tomar acción según el tipo
    if (action === 'warn') {
      await db.notification.create({
        data: {
          userId: alert.userId,
          type: 'warning',
          title: '⚠️ Advertencia de seguridad',
          message: 'Se ha detectado actividad sospechosa en tu cuenta. Por favor, juega limpio.',
          data: JSON.stringify({ alertId })
        }
      });
    } else if (action === 'ban') {
      await db.user.update({
        where: { id: alert.userId },
        data: { status: 'banned' }
      });
      
      await db.notification.create({
        data: {
          userId: alert.userId,
          type: 'critical',
          title: '🚫 Cuenta suspendida',
          message: 'Tu cuenta ha sido suspendida por violar las reglas del juego.',
          data: JSON.stringify({ alertId, reason: alert.description })
        }
      });
    }
    
    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: adminId,
        action: `admin_resolve_cheat_alert_${action}`,
        details: JSON.stringify({ alertId, targetUserId: alert.userId })
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resolving alert:', error);
    return NextResponse.json({ error: 'Error resolving alert' }, { status: 500 });
  }
}
