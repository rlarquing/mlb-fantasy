import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todos los partidos con detalles
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const games = await db.game.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
        _count: {
          select: { predictions: true }
        }
      },
      orderBy: { gameDate: 'desc' }
    });
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Error fetching games' }, { status: 500 });
  }
}

// POST - Crear nuevo partido
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adminId, homeTeamId, awayTeamId, gameDate, stadium } = body;
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const game = await db.game.create({
      data: {
        homeTeamId,
        awayTeamId,
        gameDate: new Date(gameDate),
        stadium,
        status: 'scheduled'
      },
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });
    
    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: adminId,
        action: 'admin_create_game',
        details: JSON.stringify({ gameId: game.id })
      }
    });
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Error creating game' }, { status: 500 });
  }
}

// PATCH - Actualizar partido (resultado, estado)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { adminId, gameId, action, homeScore, awayScore, status, winnerId } = body;
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    let updateData: Record<string, unknown> = {};
    
    switch (action) {
      case 'setScore':
        updateData.homeScore = homeScore;
        updateData.awayScore = awayScore;
        break;
      case 'setStatus':
        updateData.status = status; // 'scheduled', 'live', 'finished'
        break;
      case 'setWinner':
        updateData.winnerId = winnerId;
        updateData.status = 'finished';
        break;
      case 'finish':
        updateData.status = 'finished';
        break;
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
    
    const game = await db.game.update({
      where: { id: gameId },
      data: updateData,
      include: {
        homeTeam: true,
        awayTeam: true
      }
    });
    
    // Si se establece un ganador, calcular puntos
    if (action === 'setWinner' && winnerId) {
      // Obtener todas las predicciones correctas
      const correctPredictions = await db.prediction.findMany({
        where: {
          gameId,
          predictedWinnerId: winnerId
        }
      });
      
      // Asignar puntos a cada predicción correcta
      for (const pred of correctPredictions) {
        await db.prediction.update({
          where: { id: pred.id },
          data: { isCorrect: true, points: 10 }
        });
        
        // Actualizar puntos del usuario
        await db.user.update({
          where: { id: pred.userId },
          data: { totalPoints: { increment: 10 } }
        });
      }
      
      // Marcar predicciones incorrectas
      await db.prediction.updateMany({
        where: {
          gameId,
          predictedWinnerId: { not: winnerId }
        },
        data: { isCorrect: false, points: 0 }
      });
    }
    
    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: adminId,
        action: `admin_${action}`,
        details: JSON.stringify({ gameId, updateData })
      }
    });
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Error updating game' }, { status: 500 });
  }
}

// DELETE - Eliminar partido
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const gameId = searchParams.get('gameId');
    
    // Verificar que es admin
    const admin = await db.user.findUnique({ where: { id: adminId || '' } });
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Eliminar predicciones del partido
    await db.prediction.deleteMany({ where: { gameId: gameId || '' } });
    
    // Eliminar partido
    await db.game.delete({ where: { id: gameId || '' } });
    
    // Registrar actividad
    await db.activityLog.create({
      data: {
        userId: adminId || '',
        action: 'admin_delete_game',
        details: JSON.stringify({ deletedGameId: gameId })
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Error deleting game' }, { status: 500 });
  }
}
