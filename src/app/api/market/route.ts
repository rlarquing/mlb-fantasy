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
    const isFree = searchParams.get('isFree')
    const search = searchParams.get('search')
    const userId = searchParams.get('userId')

    // Obtener liga activa
    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    // Construir filtros
    const where: Record<string, unknown> = {}
    if (position) where.position = position
    if (isFree !== null) where.isFree = isFree === 'true'
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
        signings: userId ? {
          where: { userId }
        } : false
      },
      orderBy: [
        { isStar: 'desc' },
        { marketValue: 'desc' }
      ]
    })

    // Si hay usuario, obtener su balance y fichajes
    let userData = null
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          balance: true,
          totalPoints: true
        }
      })
      
      const signings = await db.signing.findMany({
        where: { userId },
        include: {
          player: {
            include: { team: true }
          }
        }
      })

      userData = {
        balance: user?.balance || 0,
        totalPoints: user?.totalPoints || 0,
        signings,
        signingCount: signings.length
      }
    }

    return NextResponse.json({
      league,
      players,
      userData,
      marketOpen: league.marketOpen
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

    // Verificar que el usuario puede fichar
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        signings: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Usuario no activo' }, { status: 403 })
    }

    if (user.paymentStatus !== 'paid') {
      return NextResponse.json({ error: 'Debes pagar para fichar jugadores' }, { status: 403 })
    }

    // Obtener liga activa
    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    if (!league || !league.marketOpen) {
      return NextResponse.json({ error: 'El mercado está cerrado' }, { status: 403 })
    }

    // Verificar límites
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
      data: { isFree: false }
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
      message: 'Jugador fichado correctamente',
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
    const signing = await db.signing.findUnique({
      where: {
        userId_playerId: {
          userId: session.user.id,
          playerId
        }
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

    if (!league || !league.marketOpen) {
      return NextResponse.json({ error: 'El mercado está cerrado' }, { status: 403 })
    }

    // Calcular precio de venta (70% del valor de mercado)
    const sellPrice = Math.floor(signing.player.marketValue * 0.7)

    // Eliminar fichaje
    await db.signing.delete({
      where: { id: signing.id }
    })

    // Actualizar jugador a libre
    await db.player.update({
      where: { id: playerId },
      data: { isFree: true }
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
        toUserId: session.user.id, // Se vende al mercado
        leagueId: league.id,
        price: sellPrice,
        type: 'sell',
        status: 'completed',
        completedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Jugador vendido correctamente',
      sellPrice 
    })
  } catch (error) {
    console.error('Error selling player:', error)
    return NextResponse.json({ error: 'Error al vender jugador' }, { status: 500 })
  }
}
