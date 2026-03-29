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
                totalPoints: true,
                balance: true
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
          lineupSize: 11,
          marketOpen: true,
          monthlyFee: 500,
          season: new Date().getFullYear().toString(),
          isActive: true,
          pointRules: {
            create: getDefaultPointRules()
          }
        },
        include: {
          pointRules: true,
          members: true,
          _count: { select: { members: true } }
        }
      })
    }

    // Obtener todos los usuarios
    const allUsers = await db.user.findMany({
      where: { role: 'user' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        paymentStatus: true,
        totalPoints: true,
        balance: true,
        createdAt: true,
        lastPaymentDate: true,
        paymentDueDate: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      league,
      allUsers
    })
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

     
    const updateData: Record<string, any> = {}
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
      data: updateData,
      include: { pointRules: true }
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

      // Resetear usuarios (excepto admin)
      await db.user.updateMany({
        where: { role: 'user' },
        data: {
          totalPoints: 0,
          balance: 100000000,
          paymentStatus: 'unpaid',
          isPaid: false,
          status: 'pending',
          lastPaymentDate: null,
          paymentDueDate: null
        }
      })

      // Eliminar fichajes, lineups, transferencias
      await db.signing.deleteMany({})
      await db.lineupEntry.deleteMany({})
      await db.lineup.deleteMany({})
      await db.transfer.deleteMany({})
      await db.leagueMember.deleteMany({})

      // Resetear jugadores a libres
      await db.player.updateMany({
        data: { 
          isFree: true,
          ownership: 0
        }
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
          lineupSize: 11,
          marketOpen: true,
          monthlyFee: 500,
          isActive: true,
          pointRules: {
            create: getDefaultPointRules()
          }
        }
      })

      return NextResponse.json({ message: 'Liga reseteada correctamente', league: newLeague })
    }

    if (action === 'updatePrices') {
      // Actualizar precios de jugadores basado en rendimiento
      const players = await db.player.findMany()
      
      for (const player of players) {
        const avgPoints = player.avgPoints || 0
        const performanceFactor = Math.max(0.8, Math.min(1.2, 1 + (player.totalFantasyPoints - avgPoints * 26) / 100))
        const newPrice = Math.round(player.price * performanceFactor)
        const boundedPrice = Math.max(500000, Math.min(50000000, newPrice))
        
        await db.player.update({
          where: { id: player.id },
          data: {
            previousPrice: player.price,
            price: boundedPrice,
            marketValue: boundedPrice
          }
        })
      }
      
      return NextResponse.json({ message: 'Precios actualizados' })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error resetting league:', error)
    return NextResponse.json({ error: 'Error al resetear liga' }, { status: 500 })
  }
}

// Reglas de puntos por defecto
function getDefaultPointRules() {
  return [
    { category: 'batting', action: 'hit', points: 1, description: 'Hit (sencillo)' },
    { category: 'batting', action: 'double', points: 2, description: 'Doble' },
    { category: 'batting', action: 'triple', points: 3, description: 'Triple' },
    { category: 'batting', action: 'home_run', points: 4, description: 'Home Run' },
    { category: 'batting', action: 'rbi', points: 1, description: 'Carrera impulsada' },
    { category: 'batting', action: 'run', points: 1, description: 'Carrera anotada' },
    { category: 'batting', action: 'stolen_base', points: 2, description: 'Base robada' },
    { category: 'batting', action: 'walk', points: 1, description: 'Base por bolas' },
    { category: 'batting', action: 'strikeout', points: -1, description: 'Ponche (bateador)' },
    { category: 'pitching', action: 'win', points: 5, description: 'Victoria' },
    { category: 'pitching', action: 'save', points: 5, description: 'Salvamento' },
    { category: 'pitching', action: 'inning_pitched', points: 1, description: 'Entrada lanzada' },
    { category: 'pitching', action: 'strikeout_pitcher', points: 1, description: 'Ponche (pitcher)' },
    { category: 'pitching', action: 'earned_run', points: -2, description: 'Carrera limpia' },
    { category: 'pitching', action: 'loss', points: -3, description: 'Derrota' },
  ]
}
