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
        pointRules: {
          where: { active: true }
        },
        _count: {
          select: { members: true }
        }
      }
    })

    if (!league) {
      // Crear liga por defecto si no existe
      const adminUser = await db.user.findFirst({
        where: { role: 'admin' }
      })
      
      if (adminUser) {
        const newLeague = await db.league.create({
          data: {
            name: 'MLB Fantasy Liga',
            description: 'Liga principal de MLB Fantasy',
            createdBy: adminUser.id,
            budget: 100000000,
            maxPlayers: 25,
            lineupSize: 9,
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
            _count: { select: { members: true } }
          }
        })
        return NextResponse.json({
          league: newLeague,
          standings: [],
          stats: { totalMembers: 0, currentWeek: getCurrentWeek() }
        })
      }
      
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    // Obtener todos los usuarios activos ordenados por puntos
    const users = await db.user.findMany({
      where: {
        status: { in: ['active', 'pending'] },
        role: { not: 'admin' }
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        totalPoints: true,
        balance: true,
        paymentStatus: true,
        status: true
      },
      orderBy: { totalPoints: 'desc' }
    })

    // Agregar ranking
    const standings = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      id: `standing-${user.id}`
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
        signings: { some: {} }
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
        entries: {
          where: { isStarter: true },
          include: {
            player: {
              select: { name: true, team: { select: { shortName: true } } }
            }
          }
        }
      },
      orderBy: { totalPoints: 'desc' },
      take: 5
    })

    return NextResponse.json({
      league,
      standings,
      stats: {
        totalMembers: users.length,
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

    if (!user || user.status === 'banned' || user.status === 'expelled') {
      return NextResponse.json({ error: 'Usuario no autorizado' }, { status: 403 })
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
