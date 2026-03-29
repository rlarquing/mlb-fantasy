import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { LINEUP_SIZE, LINEUP_POSITIONS, validateLineup } from '@/lib/scoring'

// GET - Obtener lineup
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id
    const week = searchParams.get('week')

    // Obtener liga activa
    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    // Calcular semana actual si no se especifica
    const currentWeek = week ? parseInt(week) : getCurrentWeek()
    const currentSeason = new Date().getFullYear().toString()

    // Obtener lineup existente
    const existingLineup = await db.lineup.findFirst({
      where: {
        leagueId: league.id,
        userId,
        week: currentWeek,
        season: currentSeason
      },
      include: {
        entries: {
          include: {
            player: {
              include: {
                team: {
                  select: { name: true, shortName: true, city: true }
                }
              }
            }
          }
        }
      }
    })

    // Obtener jugadores del usuario
    const signings = await db.signing.findMany({
      where: { userId },
      include: {
        player: {
          include: {
            team: {
              select: { name: true, shortName: true, city: true }
            }
          }
        }
      }
    })

    // Obtener reglas de puntos
    const pointRules = await db.pointRule.findMany({
      where: { leagueId: league.id, active: true }
    })

    return NextResponse.json({
      lineup: existingLineup,
      signings,
      league,
      currentWeek,
      currentSeason,
      pointRules,
      lineupSize: LINEUP_SIZE,
      lineupPositions: LINEUP_POSITIONS
    })
  } catch (error) {
    console.error('Error fetching lineup:', error)
    return NextResponse.json({ error: 'Error al obtener lineup' }, { status: 500 })
  }
}

// POST - Guardar lineup
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { entries, week, season } = body

    // Verificar usuario
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || (user.status !== 'active' && user.role !== 'admin')) {
      return NextResponse.json({ error: 'Usuario no autorizado para lineup' }, { status: 403 })
    }

    if (user.paymentStatus !== 'paid' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Debes pagar la mensualidad para configurar tu lineup' }, { status: 403 })
    }

    // Obtener liga
    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    const currentWeek = week || getCurrentWeek()
    const currentSeason = season || new Date().getFullYear().toString()

    // Validar lineup
    const validation = validateLineup(entries)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('. ') }, { status: 400 })
    }

    // Verificar que los jugadores pertenecen al usuario
    const playerIds = entries.map((e: { playerId: string }) => e.playerId)
    const signings = await db.signing.findMany({
      where: {
        userId: session.user.id,
        playerId: { in: playerIds }
      }
    })

    if (signings.length !== playerIds.length) {
      return NextResponse.json({ error: 'Algunos jugadores no están en tu plantilla' }, { status: 400 })
    }

    // Eliminar lineup anterior si existe
    const existingLineup = await db.lineup.findFirst({
      where: {
        leagueId: league.id,
        userId: session.user.id,
        week: currentWeek,
        season: currentSeason
      }
    })

    if (existingLineup) {
      await db.lineupEntry.deleteMany({
        where: { lineupId: existingLineup.id }
      })
      await db.lineup.delete({
        where: { id: existingLineup.id }
      })
    }

    // Crear nuevo lineup
    const lineup = await db.lineup.create({
      data: {
        leagueId: league.id,
        userId: session.user.id,
        week: currentWeek,
        season: currentSeason,
        isSet: true,
        entries: {
          create: entries.map((entry: { playerId: string; position: string; isStarter: boolean; isCaptain?: boolean }) => ({
            playerId: entry.playerId,
            position: entry.position,
            isStarter: entry.isStarter,
            isCaptain: entry.isCaptain || false,
            userId: session.user.id,
            week: currentWeek
          }))
        }
      },
      include: {
        entries: {
          include: {
            player: {
              include: { team: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Lineup guardado correctamente',
      lineup
    })
  } catch (error) {
    console.error('Error saving lineup:', error)
    return NextResponse.json({ error: 'Error al guardar lineup' }, { status: 500 })
  }
}

// Función auxiliar para obtener la semana actual de la temporada MLB
function getCurrentWeek(): number {
  const now = new Date()
  const seasonStart = new Date(now.getFullYear(), 2, 28)
  const diffTime = now.getTime() - seasonStart.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const week = Math.ceil(diffDays / 7)
  return Math.max(1, Math.min(26, week))
}
