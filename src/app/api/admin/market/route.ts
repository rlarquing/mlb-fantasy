import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET - Obtener estado del mercado
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const league = await db.league.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        marketOpen: true,
        marketOpenDate: true,
        marketCloseDate: true
      }
    })

    // Estadísticas del mercado
    const totalPlayers = await db.player.count()
    const freeAgents = await db.player.count({ where: { isFree: true } })
    const signedPlayers = await db.player.count({ where: { isFree: false } })
    
    const totalTransfers = await db.transfer.count({
      where: { status: 'completed' }
    })

    const recentTransfers = await db.transfer.findMany({
      where: { status: 'completed' },
      include: {
        player: {
          select: { name: true, position: true }
        },
        fromUser: { select: { name: true } },
        toUser: { select: { name: true } }
      },
      orderBy: { completedAt: 'desc' },
      take: 20
    })

    // Jugadores más fichados
    const mostOwnedPlayers = await db.player.findMany({
      where: {
        signings: { some: {} }
      },
      include: {
        team: { select: { shortName: true } },
        _count: { select: { signings: true } }
      },
      orderBy: {
        ownership: 'desc'
      },
      take: 10
    })

    return NextResponse.json({
      league,
      stats: {
        totalPlayers,
        freeAgents,
        signedPlayers,
        totalTransfers
      },
      recentTransfers,
      mostOwnedPlayers
    })
  } catch (error) {
    console.error('Error fetching market:', error)
    return NextResponse.json({ error: 'Error al obtener mercado' }, { status: 500 })
  }
}

// PATCH - Abrir/cerrar mercado
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { marketOpen, leagueId } = body

    const league = await db.league.findFirst({
      where: leagueId ? { id: leagueId } : { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'Liga no encontrada' }, { status: 404 })
    }

    await db.league.update({
      where: { id: league.id },
      data: { marketOpen }
    })

    // Crear notificación para todos los usuarios
    const users = await db.user.findMany({
      where: { role: 'user', status: 'active' }
    })

    for (const user of users) {
      await db.notification.create({
        data: {
          userId: user.id,
          type: marketOpen ? 'market_open' : 'market_closed',
          title: marketOpen ? 'Mercado Abierto' : 'Mercado Cerrado',
          message: marketOpen 
            ? 'El mercado de fichajes está abierto. ¡Ficha a tus jugadores!'
            : 'El mercado de fichajes ha sido cerrado temporalmente.'
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      message: marketOpen ? 'Mercado abierto' : 'Mercado cerrado'
    })
  } catch (error) {
    console.error('Error updating market:', error)
    return NextResponse.json({ error: 'Error al actualizar mercado' }, { status: 500 })
  }
}

// POST - Acciones especiales del mercado
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { action, playerId, newPrice } = body

    if (action === 'updatePrice' && playerId) {
      // Actualizar precio de un jugador específico
      await db.player.update({
        where: { id: playerId },
        data: {
          previousPrice: (await db.player.findUnique({ where: { id: playerId } }))?.price || 5000000,
          price: newPrice,
          marketValue: newPrice
        }
      })
      return NextResponse.json({ message: 'Precio actualizado' })
    }

    if (action === 'releasePlayer' && playerId) {
      // Liberar un jugador al mercado
      const signing = await db.signing.findFirst({
        where: { playerId }
      })
      
      if (signing) {
        await db.signing.delete({ where: { id: signing.id } })
        await db.player.update({
          where: { id: playerId },
          data: { isFree: true, ownership: { decrement: 1 } }
        })
      }
      return NextResponse.json({ message: 'Jugador liberado al mercado' })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error in market action:', error)
    return NextResponse.json({ error: 'Error en acción del mercado' }, { status: 500 })
  }
}
