import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

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
    const season = searchParams.get('season')

    // Obtener liga activa
    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    // Calcular semana actual si no se especifica
    const currentWeek = week ? parseInt(week) : getCurrentWeek()
    const currentSeason = season || new Date().getFullYear().toString()

    // Obtener o crear lineup
    let lineup = await db.lineup.findFirst({
      where: {
        userId,
        leagueId: league.id,
        week: currentWeek,
        season: currentSeason
      },
      include: {
        entries: {
          include: {
            player: {
              include: {
                team: {
                  select: { name: true, shortName: true }
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
              select: { name: true, shortName: true }
            }
          }
        }
      }
    })

    // Obtener reglas de puntos
    const pointRules = await db.pointRule.findMany({
      where: { leagueId: league.id }
    })

    return NextResponse.json({
      lineup,
      signings,
      league,
      currentWeek,
      currentSeason,
      pointRules
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

    if (!user || user.status !== 'active' || user.paymentStatus !== 'paid') {
      return NextResponse.json({ error: 'Usuario no autorizado para lineup' }, { status: 403 })
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

    // Verificar cantidad de titulares
    const starters = entries.filter((e: { isStarter: boolean }) => e.isStarter)
    if (starters.length !== league.lineupSize) {
      return NextResponse.json({ error: `Debes tener exactamente ${league.lineupSize} titulares` }, { status: 400 })
    }

    // Eliminar lineup anterior si existe
    const existingLineup = await db.lineup.findFirst({
      where: {
        userId: session.user.id,
        leagueId: league.id,
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
        userId: session.user.id,
        leagueId: league.id,
        week: currentWeek,
        season: currentSeason,
        isSet: true,
        entries: {
          create: entries.map((entry: { playerId: string; position: string; isStarter: boolean }) => ({
            playerId: entry.playerId,
            position: entry.position,
            isStarter: entry.isStarter
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
  const seasonStart = new Date(now.getFullYear(), 2, 28) // 28 de marzo aproximadamente
  const diffTime = now.getTime() - seasonStart.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const week = Math.ceil(diffDays / 7)
  return Math.max(1, Math.min(26, week)) // Máximo 26 semanas en temporada regular
}
