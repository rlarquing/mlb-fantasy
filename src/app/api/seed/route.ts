import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { MLB_TEAMS } from '@/lib/mlb-data'
import { MLB_PLAYERS } from '@/lib/mlb-players'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { adminKey } = body
    
    // Simple protection
    if (adminKey !== 'mlb-fantasy-seed-2024') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Seed teams
    const existingTeams = await db.mLBTeam.count()
    if (existingTeams === 0) {
      await db.mLBTeam.createMany({
        data: MLB_TEAMS.map(team => ({
          name: team.name,
          shortName: team.shortName,
          city: team.city,
          division: team.division,
          logo: team.logo,
          wins: team.wins,
          losses: team.losses,
        }))
      })
    }

    // Get team map
    const teams = await db.mLBTeam.findMany()
    const teamMap = new Map(teams.map(t => [t.shortName, t.id]))

    // Seed players
    const existingPlayers = await db.player.count()
    if (existingPlayers === 0) {
      await db.player.createMany({
        data: MLB_PLAYERS.map(player => ({
          name: player.name,
          position: player.position.includes('/') ? player.position.split('/')[0] : player.position,
          teamId: teamMap.get(player.team) || null,
          number: player.number,
          price: player.price,
          marketValue: player.price,
          previousPrice: player.price,
          isStar: player.isStar || false,
          isFree: true,
          hr: player.hr || 0,
          rbi: player.rbi || 0,
          avg: player.avg || null,
          era: player.era || null,
          wins: player.wins || 0,
          losses: player.losses || 0,
          saves: player.saves || 0,
          strikeouts: player.strikeouts || 0,
          runs: player.runs || 0,
          sb: player.sb || 0,
          totalFantasyPoints: Math.floor(Math.random() * 100) + (player.isStar ? 200 : 50),
          ownership: 0
        }))
      })
    }

    // Seed league if not exists
    const existingLeague = await db.league.count()
    if (existingLeague === 0) {
      // Find admin user or create one
      let adminUser = await db.user.findFirst({
        where: { role: 'admin' }
      })

      if (!adminUser) {
        adminUser = await db.user.create({
          data: {
            email: process.env.ADMIN_EMAIL || 'admin@mlbfantasy.com',
            name: 'Administrador',
            role: 'admin',
            status: 'active',
            paymentStatus: 'paid',
            balance: 100000000,
            isPaid: true,
            lastPaymentDate: new Date()
          }
        })
      }

      await db.league.create({
        data: {
          name: 'MLB Fantasy Liga',
          description: 'Liga principal de MLB Fantasy',
          createdBy: adminUser.id,
          budget: 100000000,
          maxPlayers: 25,
          lineupSize: 11,
          marketOpen: true,
          monthlyFee: 500,
          season: new Date().getFullYear().toString(),
          isActive: true,
          pointRules: {
            create: [
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
        }
      })
    }

    // Crear temporada activa si no existe
    const existingSeason = await db.season.count()
    if (existingSeason === 0) {
      await db.season.create({
        data: {
          name: `Temporada ${new Date().getFullYear()}`,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 8)),
          status: 'active',
          currentWeek: 1,
          marketOpen: true
        }
      })
    }

    const teamCount = await db.mLBTeam.count()
    const playerCount = await db.player.count()
    const leagueCount = await db.league.count()

    return NextResponse.json({
      message: 'Seed completado exitosamente',
      teams: teamCount,
      players: playerCount,
      leagues: leagueCount
    })
  } catch (error) {
    console.error('Error seeding:', error)
    return NextResponse.json({ error: 'Error al sembrar datos' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const teamCount = await db.mLBTeam.count()
    const playerCount = await db.player.count()
    const leagueCount = await db.league.count()
    const userCount = await db.user.count()

    return NextResponse.json({
      teams: teamCount,
      players: playerCount,
      leagues: leagueCount,
      users: userCount
    })
  } catch (error) {
    console.error('Error checking seed:', error)
    return NextResponse.json({ error: 'Error al verificar datos' }, { status: 500 })
  }
}
