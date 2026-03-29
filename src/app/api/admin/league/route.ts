import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET - Obtener configuración de la liga
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    let league = await db.league.findFirst({
      where: { isActive: true },
      include: {
        pointRules: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
                paymentStatus: true,
                totalPoints: true
              }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      }
    })

    // Crear liga por defecto si no existe
    if (!league) {
      league = await db.league.create({
        data: {
          name: 'MLB Fantasy Liga',
          description: 'Liga principal de MLB Fantasy',
          createdBy: session.user.id,
          budget: 100000000,
          maxPlayers: 25,
          lineupSize: 9,
          marketOpen: true,
          monthlyFee: 500,
          season: new Date().getFullYear().toString(),
          pointRules: {
            create: [
              { action: 'hit', points: 1, description: 'Hit' },
              { action: 'home_run', points: 4, description: 'Home Run' },
              { action: 'rbi', points: 1, description: 'Carrera impulsada' },
              { action: 'run', points: 1, description: 'Carrera anotada' },
              { action: 'stolen_base', points: 2, description: 'Base robada' },
              { action: 'win', points: 5, description: 'Victoria de pitcher' },
              { action: 'save', points: 3, description: 'Salvado' },
              { action: 'strikeout', points: 1, description: 'Ponche (pitcher)' },
              { action: 'innings_pitched', points: 1, description: 'Entrada lanzada' }
            ]
          }
        },
        include: {
          pointRules: true,
          members: true,
          _count: { select: { members: true } }
        }
      })
    }

    return NextResponse.json(league)
  } catch (error) {
    console.error('Error fetching league:', error)
    return NextResponse.json({ error: 'Error al obtener liga' }, { status: 500 })
  }
}

// PATCH - Actualizar configuración de la liga
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      leagueId, 
      name, 
      budget, 
      maxPlayers, 
      lineupSize, 
      marketOpen, 
      monthlyFee, 
      marketOpenDate,
      marketCloseDate,
      seasonStart,
      seasonEnd
    } = body

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (budget !== undefined) updateData.budget = budget
    if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers
    if (lineupSize !== undefined) updateData.lineupSize = lineupSize
    if (marketOpen !== undefined) updateData.marketOpen = marketOpen
    if (monthlyFee !== undefined) updateData.monthlyFee = monthlyFee
    if (marketOpenDate !== undefined) updateData.marketOpenDate = marketOpenDate ? new Date(marketOpenDate) : null
    if (marketCloseDate !== undefined) updateData.marketCloseDate = marketCloseDate ? new Date(marketCloseDate) : null
    if (seasonStart !== undefined) updateData.seasonStart = seasonStart ? new Date(seasonStart) : null
    if (seasonEnd !== undefined) updateData.seasonEnd = seasonEnd ? new Date(seasonEnd) : null

    const league = await db.league.update({
      where: { id: leagueId },
      data: updateData
    })

    return NextResponse.json(league)
  } catch (error) {
    console.error('Error updating league:', error)
    return NextResponse.json({ error: 'Error al actualizar liga' }, { status: 500 })
  }
}

// POST - Resetear liga (nueva temporada)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { action, leagueId, newSeason } = body

    if (action === 'reset') {
      // Desactivar liga anterior
      await db.league.update({
        where: { id: leagueId },
        data: { isActive: false }
      })

      // Resetear usuarios
      await db.user.updateMany({
        data: {
          totalPoints: 0,
          balance: 100000000,
          paymentStatus: 'unpaid'
        }
      })

      // Eliminar fichajes, lineups, transferencias
      await db.signing.deleteMany({})
      await db.lineupEntry.deleteMany({})
      await db.lineup.deleteMany({})
      await db.transfer.deleteMany({})

      // Resetear jugadores a libres
      await db.player.updateMany({
        data: { isFree: true }
      })

      // Crear nueva liga
      const newLeague = await db.league.create({
        data: {
          name: `MLB Fantasy Liga ${newSeason || new Date().getFullYear()}`,
          description: 'Liga principal de MLB Fantasy',
          createdBy: session.user.id,
          season: newSeason || new Date().getFullYear().toString(),
          budget: 100000000,
          maxPlayers: 25,
          lineupSize: 9,
          marketOpen: true,
          monthlyFee: 500,
          pointRules: {
            create: [
              { action: 'hit', points: 1, description: 'Hit' },
              { action: 'home_run', points: 4, description: 'Home Run' },
              { action: 'rbi', points: 1, description: 'Carrera impulsada' },
              { action: 'run', points: 1, description: 'Carrera anotada' },
              { action: 'stolen_base', points: 2, description: 'Base robada' },
              { action: 'win', points: 5, description: 'Victoria de pitcher' },
              { action: 'save', points: 3, description: 'Salvado' },
              { action: 'strikeout', points: 1, description: 'Ponche (pitcher)' },
              { action: 'innings_pitched', points: 1, description: 'Entrada lanzada' }
            ]
          }
        }
      })

      return NextResponse.json({ message: 'Liga reseteada', league: newLeague })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error resetting league:', error)
    return NextResponse.json({ error: 'Error al resetear liga' }, { status: 500 })
  }
}
