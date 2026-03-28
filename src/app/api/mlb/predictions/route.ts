import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener predicciones de un usuario
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    const predictions = await db.prediction.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            homeTeam: true,
            awayTeam: true,
          }
        }
      }
    });
    
    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json({ error: 'Error fetching predictions' }, { status: 500 });
  }
}

// POST - Crear una predicción
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, gameId, predictedWinnerId, predictedHomeScore, predictedAwayScore } = body;
    
    // Verificar si ya existe una predicción para este partido
    const existing = await db.prediction.findFirst({
      where: { userId, gameId }
    });
    
    if (existing) {
      // Actualizar predicción existente
      const updated = await db.prediction.update({
        where: { id: existing.id },
        data: {
          predictedWinnerId,
          predictedHomeScore,
          predictedAwayScore,
        }
      });
      return NextResponse.json(updated);
    }
    
    // Crear nueva predicción
    const prediction = await db.prediction.create({
      data: {
        userId,
        gameId,
        predictedWinnerId,
        predictedHomeScore,
        predictedAwayScore,
      }
    });
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error creating prediction:', error);
    return NextResponse.json({ error: 'Error creating prediction' }, { status: 500 });
  }
}
