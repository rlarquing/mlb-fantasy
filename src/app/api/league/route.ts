import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET - Obtener clasificación y miembros de la liga
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('leagueId')

    // Obtener liga activa
    const league = await db.league.findFirst({
      where: leagueId ? { id: leagueId } : { isActive: true },
      include: {
        pointRules: true,
        _count: {
          select: { members: true }
        }
      }
    })

    if (!league) {
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    // Obtener clasificación
    const standings = await db.leagueMember.findMany({
      where: { 
        leagueId: league.id,
        isActive: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            totalPoints: true,
            balance: true,
            paymentStatus: true,
            status: true
          }
        }
      },
      orderBy: [
        { totalPoints: 'desc' }
      ]
    })

    // Agregar ranking
    const rankedStandings = standings.map((member, index) => ({
      ...member,
      rank: index + 1
    }))

    // Obtener estadísticas de la liga
    const totalTransfers = await db.transfer.count({
      where: { 
        leagueId: league.id,
        status: 'completed'
      }
    })

    const totalLineups = await db.lineup.count({
      where: { leagueId: league.id, isSet: true }
    })

    // Top jugadores más fichados
    const topPlayers = await db.player.findMany({
      where: {
        signings: {
          some: {}
        }
      },
      include: {
        team: {
          select: { name: true, shortName: true }
        },
        _count: {
          select: { signings: true }
        }
      },
      orderBy: {
        totalFantasyPoints: 'desc'
      },
      take: 10
    })

    // Mejores lineup de la semana
    const currentWeek = getCurrentWeek()
    const topLineups = await db.lineup.findMany({
      where: {
        leagueId: league.id,
        week: currentWeek,
        isSet: true
      },
      include: {
        user: {
          select: { name: true, image: true }
        }
      },
      orderBy: { totalPoints: 'desc' },
      take: 5
    })

    return NextResponse.json({
      league,
      standings: rankedStandings,
      stats: {
        totalMembers: standings.length,
        totalTransfers,
        totalLineups,
        currentWeek
      },
      topPlayers,
      topLineups
    })
  } catch (error) {
    console.error('Error fetching league:', error)
    return NextResponse.json({ error: 'Error al obtener liga' }, { status: 500 })
  }
}

// POST - Unirse a la liga
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { leagueId } = body

    // Verificar usuario
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.status !== 'active') {
      return NextResponse.json({ error: 'Usuario no activo' }, { status: 403 })
    }

    // Obtener liga
    const league = await db.league.findFirst({
      where: leagueId ? { id: leagueId } : { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'Liga no encontrada' }, { status: 404 })
    }

    // Verificar si ya es miembro
    const existingMember = await db.leagueMember.findUnique({
      where: {
        leagueId_userId: {
          leagueId: league.id,
          userId: session.user.id
        }
      }
    })

    if (existingMember) {
      return NextResponse.json({ message: 'Ya eres miembro de esta liga', member: existingMember })
    }

    // Crear membresía
    const member = await db.leagueMember.create({
      data: {
        leagueId: league.id,
        userId: session.user.id,
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'Te has unido a la liga',
      member
    })
  } catch (error) {
    console.error('Error joining league:', error)
    return NextResponse.json({ error: 'Error al unirse a la liga' }, { status: 500 })
  }
}

// Función auxiliar para obtener la semana actual
function getCurrentWeek(): number {
  const now = new Date()
  const seasonStart = new Date(now.getFullYear(), 2, 28)
  const diffTime = now.getTime() - seasonStart.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const week = Math.ceil(diffDays / 7)
  return Math.max(1, Math.min(26, week))
}
