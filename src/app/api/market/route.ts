import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET - Obtener mercado de jugadores
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const teamId = searchParams.get('teamId')
    const search = searchParams.get('search')
    const userId = searchParams.get('userId') || session.user.id

    // Obtener liga activa
    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    // Construir filtros
     
    const where: any = {}
    if (position) where.position = position
    if (teamId) where.teamId = teamId
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { team: { name: { contains: search } } }
      ]
    }

    // Obtener jugadores
    const players = await db.player.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            name: true,
            shortName: true,
            city: true
          }
        },
        signings: {
          where: { userId }
        }
      },
      orderBy: [
        { isStar: 'desc' },
        { marketValue: 'desc' }
      ]
    })

    // Formatear jugadores
    const formattedPlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      position: p.position,
      team: p.team,
      price: p.price,
      marketValue: p.marketValue,
      isStar: p.isStar,
      isFree: p.isFree,
      hr: p.hr,
      rbi: p.rbi,
      avg: p.avg,
      era: p.era,
      wins: p.wins,
      saves: p.saves,
      totalFantasyPoints: p.totalFantasyPoints,
      number: p.number
    }))

    // Obtener datos del usuario
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        balance: true,
        totalPoints: true
      }
    })

    // Obtener fichajes del usuario
    const signings = await db.signing.findMany({
      where: { userId },
      include: {
        player: {
          include: { team: true }
        }
      }
    })

    return NextResponse.json({
      league,
      players: formattedPlayers,
      userData: {
        balance: user?.balance || 0,
        totalPoints: user?.totalPoints || 0,
        signings,
        signingCount: signings.length
      },
      marketOpen: league?.marketOpen || false
    })
  } catch (error) {
    console.error('Error fetching market:', error)
    return NextResponse.json({ error: 'Error al obtener mercado' }, { status: 500 })
  }
}

// POST - Comprar jugador
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { playerId, price } = body

    // Verificar usuario
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        signings: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (user.status !== 'active' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Usuario no activo' }, { status: 403 })
    }

    // Admin no necesita pagar
    if (user.paymentStatus !== 'paid' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Debes pagar la mensualidad para fichar jugadores' }, { status: 403 })
    }

    // Obtener liga activa
    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    if (!league.marketOpen) {
      return NextResponse.json({ error: 'El mercado está cerrado' }, { status: 403 })
    }

    // Verificar límite de jugadores
    if (user.signings.length >= league.maxPlayers) {
      return NextResponse.json({ error: `Máximo ${league.maxPlayers} jugadores en plantilla` }, { status: 400 })
    }

    // Verificar jugador
    const player = await db.player.findUnique({
      where: { id: playerId }
    })

    if (!player) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 })
    }

    if (!player.isFree) {
      return NextResponse.json({ error: 'Jugador no disponible' }, { status: 400 })
    }

    const finalPrice = price || player.price

    // Verificar balance
    if (user.balance < finalPrice) {
      return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 })
    }

    // Realizar fichaje
    const signing = await db.signing.create({
      data: {
        userId: session.user.id,
        playerId,
        price: finalPrice
      }
    })

    // Actualizar jugador
    await db.player.update({
      where: { id: playerId },
      data: { 
        isFree: false,
        ownership: { increment: 1 }
      }
    })

    // Actualizar balance del usuario
    await db.user.update({
      where: { id: session.user.id },
      data: {
        balance: { decrement: finalPrice }
      }
    })

    // Registrar transferencia
    await db.transfer.create({
      data: {
        playerId,
        fromUserId: null,
        toUserId: session.user.id,
        leagueId: league.id,
        price: finalPrice,
        type: 'buy',
        status: 'completed',
        completedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: `¡Has fichado a ${player.name} correctamente!`,
      signing 
    })
  } catch (error) {
    console.error('Error buying player:', error)
    return NextResponse.json({ error: 'Error al fichar jugador' }, { status: 500 })
  }
}

// DELETE - Vender jugador
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')

    if (!playerId) {
      return NextResponse.json({ error: 'ID de jugador requerido' }, { status: 400 })
    }

    // Verificar fichaje
    const signing = await db.signing.findFirst({
      where: {
        userId: session.user.id,
        playerId
      },
      include: { player: true }
    })

    if (!signing) {
      return NextResponse.json({ error: 'No tienes este jugador' }, { status: 404 })
    }

    // Obtener liga
    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    if (!league.marketOpen) {
      return NextResponse.json({ error: 'El mercado está cerrado' }, { status: 403 })
    }

    // Calcular precio de venta (70% del valor de mercado actual)
    const sellPrice = Math.floor(signing.player.marketValue * 0.7)

    // Eliminar fichaje
    await db.signing.delete({
      where: { id: signing.id }
    })

    // Actualizar jugador a libre
    await db.player.update({
      where: { id: playerId },
      data: { 
        isFree: true,
        ownership: { decrement: 1 }
      }
    })

    // Actualizar balance
    await db.user.update({
      where: { id: session.user.id },
      data: {
        balance: { increment: sellPrice }
      }
    })

    // Registrar transferencia
    await db.transfer.create({
      data: {
        playerId,
        fromUserId: session.user.id,
        toUserId: null,
        leagueId: league.id,
        price: sellPrice,
        type: 'sell',
        status: 'completed',
        completedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: `${signing.player.name} vendido correctamente`,
      sellPrice 
    })
  } catch (error) {
    console.error('Error selling player:', error)
    return NextResponse.json({ error: 'Error al vender jugador' }, { status: 500 })
  }
}
