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
        marketCloseDate: true,
        budget: true,
        maxPlayers: true,
        lineupSize: true
      }
    })

    // Estadísticas del mercado
    const totalPlayers = await db.player.count()
    const freePlayers = await db.player.count({ where: { isFree: true } })
    const signedPlayers = await db.player.count({ where: { isFree: false } })
    const totalTransfers = await db.transfer.count()
    const pendingTransfers = await db.transfer.count({ where: { status: 'pending' } })

    // Jugadores más fichados
    const topPlayers = await db.player.findMany({
      where: { isFree: false },
      include: {
        signings: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      take: 10,
      orderBy: { marketValue: 'desc' }
    })

    return NextResponse.json({
      league,
      stats: {
        totalPlayers,
        freePlayers,
        signedPlayers,
        totalTransfers,
        pendingTransfers
      },
      topPlayers
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
    const { marketOpen, marketOpenDate, marketCloseDate } = body

    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (marketOpen !== undefined) updateData.marketOpen = marketOpen
    if (marketOpenDate !== undefined) updateData.marketOpenDate = marketOpenDate ? new Date(marketOpenDate) : null
    if (marketCloseDate !== undefined) updateData.marketCloseDate = marketCloseDate ? new Date(marketCloseDate) : null

    const updatedLeague = await db.league.update({
      where: { id: league.id },
      data: updateData
    })

    return NextResponse.json(updatedLeague)
  } catch (error) {
    console.error('Error updating market:', error)
    return NextResponse.json({ error: 'Error al actualizar mercado' }, { status: 500 })
  }
}
