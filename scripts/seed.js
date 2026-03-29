// Script para cargar datos iniciales - ejecutar con: node scripts/seed.js
const { PrismaClient } = require('@prisma/client')

const MLB_TEAMS = [
  { name: 'New York Yankees', shortName: 'NYY', city: 'New York', division: 'AL East', logo: '⚾', wins: 99, losses: 63 },
  { name: 'Boston Red Sox', shortName: 'BOS', city: 'Boston', division: 'AL East', logo: '🏟️', wins: 78, losses: 84 },
  { name: 'Tampa Bay Rays', shortName: 'TB', city: 'Tampa Bay', division: 'AL East', logo: '☀️', wins: 99, losses: 63 },
  { name: 'Toronto Blue Jays', shortName: 'TOR', city: 'Toronto', division: 'AL East', logo: '🍁', wins: 89, losses: 73 },
  { name: 'Baltimore Orioles', shortName: 'BAL', city: 'Baltimore', division: 'AL East', logo: '🦅', wins: 101, losses: 61 },
  { name: 'Chicago White Sox', shortName: 'CWS', city: 'Chicago', division: 'AL Central', logo: '⚾', wins: 61, losses: 101 },
  { name: 'Cleveland Guardians', shortName: 'CLE', city: 'Cleveland', division: 'AL Central', logo: '🛡️', wins: 92, losses: 70 },
  { name: 'Detroit Tigers', shortName: 'DET', city: 'Detroit', division: 'AL Central', logo: '🐯', wins: 78, losses: 84 },
  { name: 'Kansas City Royals', shortName: 'KC', city: 'Kansas City', division: 'AL Central', logo: '👑', wins: 56, losses: 106 },
  { name: 'Minnesota Twins', shortName: 'MIN', city: 'Minneapolis', division: 'AL Central', logo: '❄️', wins: 87, losses: 75 },
  { name: 'Houston Astros', shortName: 'HOU', city: 'Houston', division: 'AL West', logo: '🚀', wins: 90, losses: 72 },
  { name: 'Seattle Mariners', shortName: 'SEA', city: 'Seattle', division: 'AL West', logo: '⚓', wins: 88, losses: 74 },
  { name: 'Texas Rangers', shortName: 'TEX', city: 'Arlington', division: 'AL West', logo: '⭐', wins: 90, losses: 72 },
  { name: 'Los Angeles Angels', shortName: 'LAA', city: 'Anaheim', division: 'AL West', logo: '😇', wins: 73, losses: 89 },
  { name: 'Oakland Athletics', shortName: 'OAK', city: 'Oakland', division: 'AL West', logo: '🐘', wins: 50, losses: 112 },
  { name: 'Atlanta Braves', shortName: 'ATL', city: 'Atlanta', division: 'NL East', logo: '🪶', wins: 104, losses: 58 },
  { name: 'Philadelphia Phillies', shortName: 'PHI', city: 'Philadelphia', division: 'NL East', logo: '🔔', wins: 90, losses: 72 },
  { name: 'New York Mets', shortName: 'NYM', city: 'New York', division: 'NL East', logo: '🍎', wins: 75, losses: 87 },
  { name: 'Miami Marlins', shortName: 'MIA', city: 'Miami', division: 'NL East', logo: '🐟', wins: 84, losses: 78 },
  { name: 'Washington Nationals', shortName: 'WSH', city: 'Washington', division: 'NL East', logo: '🏛️', wins: 71, losses: 91 },
  { name: 'Milwaukee Brewers', shortName: 'MIL', city: 'Milwaukee', division: 'NL Central', logo: '🍺', wins: 92, losses: 70 },
  { name: 'St. Louis Cardinals', shortName: 'STL', city: 'St. Louis', division: 'NL Central', logo: '🐦', wins: 71, losses: 91 },
  { name: 'Chicago Cubs', shortName: 'CHC', city: 'Chicago', division: 'NL Central', logo: '🐻', wins: 83, losses: 79 },
  { name: 'Cincinnati Reds', shortName: 'CIN', city: 'Cincinnati', division: 'NL Central', logo: '🔴', wins: 82, losses: 80 },
  { name: 'Pittsburgh Pirates', shortName: 'PIT', city: 'Pittsburgh', division: 'NL Central', logo: '🏴‍☠️', wins: 76, losses: 86 },
  { name: 'Los Angeles Dodgers', shortName: 'LAD', city: 'Los Angeles', division: 'NL West', logo: '💎', wins: 100, losses: 62 },
  { name: 'San Diego Padres', shortName: 'SD', city: 'San Diego', division: 'NL West', logo: '🌴', wins: 82, losses: 80 },
  { name: 'San Francisco Giants', shortName: 'SF', city: 'San Francisco', division: 'NL West', logo: '🌉', wins: 79, losses: 83 },
  { name: 'Arizona Diamondbacks', shortName: 'ARI', city: 'Phoenix', division: 'NL West', logo: '🐍', wins: 84, losses: 78 },
  { name: 'Colorado Rockies', shortName: 'COL', city: 'Denver', division: 'NL West', logo: '🏔️', wins: 59, losses: 103 },
]

const MLB_PLAYERS = [
  // Yankees
  { name: 'Aaron Judge', position: 'OF', team: 'NYY', number: 99, price: 28000000, isStar: true, hr: 58, avg: 0.271, rbi: 144, runs: 122, sb: 10 },
  { name: 'Juan Soto', position: 'OF', team: 'NYY', number: 22, price: 23000000, isStar: true, hr: 35, avg: 0.275, rbi: 100, runs: 110, sb: 5 },
  { name: 'Giancarlo Stanton', position: 'DH', team: 'NYY', number: 27, price: 8000000, hr: 26, avg: 0.238, rbi: 70, runs: 45, sb: 0 },
  { name: 'Gerrit Cole', position: 'P', team: 'NYY', number: 45, price: 22000000, isStar: true, wins: 15, losses: 4, era: 2.63, saves: 0, strikeouts: 222 },
  { name: 'Gleyber Torres', position: '2B', team: 'NYY', number: 25, price: 4500000, hr: 15, avg: 0.267, rbi: 55, runs: 65, sb: 8 },
  { name: 'Anthony Volpe', position: 'SS', team: 'NYY', number: 11, price: 3500000, hr: 12, avg: 0.242, rbi: 45, runs: 75, sb: 24 },
  
  // Red Sox
  { name: 'Rafael Devers', position: '3B', team: 'BOS', number: 11, price: 8000000, hr: 33, avg: 0.271, rbi: 100, runs: 85, sb: 2 },
  { name: 'Jarren Duran', position: 'OF', team: 'BOS', number: 16, price: 4000000, hr: 15, avg: 0.285, rbi: 55, runs: 95, sb: 28 },
  { name: 'Triston Casas', position: '1B', team: 'BOS', number: 36, price: 3500000, hr: 22, avg: 0.258, rbi: 65, runs: 50, sb: 0 },
  
  // Rays
  { name: 'Yandy Diaz', position: '1B', team: 'TB', number: 2, price: 5000000, hr: 22, avg: 0.293, rbi: 70, runs: 65, sb: 0 },
  { name: 'Randy Arozarena', position: 'OF', team: 'TB', number: 56, price: 5500000, hr: 23, avg: 0.254, rbi: 83, runs: 75, sb: 20 },
  
  // Blue Jays
  { name: 'Vladimir Guerrero Jr.', position: '1B', team: 'TOR', number: 27, price: 8500000, hr: 26, avg: 0.264, rbi: 97, runs: 75, sb: 2 },
  { name: 'Bo Bichette', position: 'SS', team: 'TOR', number: 11, price: 8000000, hr: 20, avg: 0.262, rbi: 73, runs: 80, sb: 6 },
  { name: 'Kevin Gausman', position: 'P', team: 'TOR', number: 34, price: 8000000, wins: 16, losses: 9, era: 3.16, saves: 0, strikeouts: 215 },
  
  // Orioles
  { name: 'Gunnar Henderson', position: 'SS', team: 'BAL', number: 2, price: 8000000, hr: 28, avg: 0.255, rbi: 82, runs: 95, sb: 10 },
  { name: 'Adley Rutschman', position: 'C', team: 'BAL', number: 35, price: 8500000, hr: 20, avg: 0.277, rbi: 80, runs: 75, sb: 1 },
  { name: 'Corbin Burnes', position: 'P', team: 'BAL', number: 39, price: 9000000, wins: 15, losses: 8, era: 2.94, saves: 0, strikeouts: 198 },
  
  // Astros
  { name: 'Yordan Alvarez', position: 'DH', team: 'HOU', number: 44, price: 13000000, hr: 31, avg: 0.293, rbi: 97, runs: 75, sb: 0 },
  { name: 'Kyle Tucker', position: 'OF', team: 'HOU', number: 30, price: 12000000, hr: 29, avg: 0.284, rbi: 99, runs: 85, sb: 15 },
  { name: 'Jose Altuve', position: '2B', team: 'HOU', number: 27, price: 12000000, hr: 17, avg: 0.311, rbi: 51, runs: 85, sb: 15 },
  { name: 'Framber Valdez', position: 'P', team: 'HOU', number: 59, price: 6500000, wins: 15, losses: 8, era: 3.25, saves: 0, strikeouts: 185 },
  
  // Mariners
  { name: 'Julio Rodriguez', position: 'OF', team: 'SEA', number: 44, price: 9000000, hr: 32, avg: 0.275, rbi: 103, runs: 95, sb: 25 },
  { name: 'Cal Raleigh', position: 'C', team: 'SEA', number: 29, price: 4500000, hr: 30, avg: 0.235, rbi: 75, runs: 55, sb: 0 },
  { name: 'Luis Castillo', position: 'P', team: 'SEA', number: 58, price: 8000000, wins: 14, losses: 9, era: 3.34, saves: 0, strikeouts: 195 },
  
  // Rangers
  { name: 'Corey Seager', position: 'SS', team: 'TEX', number: 5, price: 14000000, hr: 33, avg: 0.277, rbi: 96, runs: 80, sb: 2 },
  { name: 'Marcus Semien', position: '2B', team: 'TEX', number: 2, price: 12000000, hr: 29, avg: 0.276, rbi: 100, runs: 95, sb: 12 },
  { name: 'Adolis Garcia', position: 'OF', team: 'TEX', number: 53, price: 6500000, hr: 36, avg: 0.254, rbi: 98, runs: 75, sb: 8 },
  
  // Braves
  { name: 'Ronald Acuna Jr.', position: 'OF', team: 'ATL', number: 13, price: 25000000, isStar: true, hr: 41, avg: 0.337, rbi: 106, runs: 149, sb: 73 },
  { name: 'Matt Olson', position: '1B', team: 'ATL', number: 28, price: 14000000, hr: 54, avg: 0.247, rbi: 139, runs: 105, sb: 4 },
  { name: 'Austin Riley', position: '3B', team: 'ATL', number: 27, price: 8500000, hr: 37, avg: 0.255, rbi: 97, runs: 85, sb: 0 },
  { name: 'Spencer Strider', position: 'P', team: 'ATL', number: 65, price: 8500000, wins: 16, losses: 5, era: 3.15, saves: 0, strikeouts: 245 },
  
  // Phillies
  { name: 'Bryce Harper', position: '1B', team: 'PHI', number: 3, price: 15000000, isStar: true, hr: 30, avg: 0.293, rbi: 87, runs: 85, sb: 5 },
  { name: 'Trea Turner', position: 'SS', team: 'PHI', number: 7, price: 13000000, hr: 26, avg: 0.266, rbi: 76, runs: 95, sb: 28 },
  { name: 'Kyle Schwarber', position: 'OF', team: 'PHI', number: 12, price: 7000000, hr: 47, avg: 0.218, rbi: 98, runs: 95, sb: 3 },
  { name: 'Zack Wheeler', position: 'P', team: 'PHI', number: 45, price: 8500000, wins: 15, losses: 6, era: 2.57, saves: 0, strikeouts: 212 },
  
  // Mets
  { name: 'Francisco Lindor', position: 'SS', team: 'NYM', number: 12, price: 12000000, hr: 31, avg: 0.254, rbi: 98, runs: 90, sb: 25 },
  { name: 'Pete Alonso', position: '1B', team: 'NYM', number: 20, price: 11000000, hr: 46, avg: 0.217, rbi: 118, runs: 85, sb: 0 },
  
  // Dodgers
  { name: 'Shohei Ohtani', position: 'DH', team: 'LAD', number: 17, price: 30000000, isStar: true, hr: 44, avg: 0.304, rbi: 95, runs: 102, sb: 18 },
  { name: 'Mookie Betts', position: 'OF', team: 'LAD', number: 50, price: 25000000, isStar: true, hr: 39, avg: 0.307, rbi: 107, runs: 120, sb: 8 },
  { name: 'Freddie Freeman', position: '1B', team: 'LAD', number: 5, price: 20000000, isStar: true, hr: 29, avg: 0.282, rbi: 102, runs: 105, sb: 5 },
  { name: 'Clayton Kershaw', position: 'P', team: 'LAD', number: 22, price: 5500000, wins: 12, losses: 6, era: 3.35, saves: 0, strikeouts: 138 },
  
  // Padres
  { name: 'Fernando Tatis Jr.', position: 'OF', team: 'SD', number: 23, price: 14000000, hr: 33, avg: 0.257, rbi: 88, runs: 95, sb: 25 },
  { name: 'Manny Machado', position: '3B', team: 'SD', number: 13, price: 13000000, hr: 30, avg: 0.258, rbi: 91, runs: 70, sb: 4 },
  { name: 'Blake Snell', position: 'P', team: 'SD', number: 4, price: 8500000, wins: 14, losses: 9, era: 2.25, saves: 0, strikeouts: 225 },
  
  // Diamondbacks
  { name: 'Corbin Carroll', position: 'OF', team: 'ARI', number: 7, price: 10000000, hr: 25, avg: 0.295, rbi: 75, runs: 110, sb: 45 },
  { name: 'Ketel Marte', position: '2B', team: 'ARI', number: 4, price: 6500000, hr: 25, avg: 0.285, rbi: 82, runs: 85, sb: 5 },
  { name: 'Zac Gallen', position: 'P', team: 'ARI', number: 23, price: 7500000, wins: 15, losses: 7, era: 3.35, saves: 0, strikeouts: 185 },
  
  // Guardians
  { name: 'Jose Ramirez', position: '3B', team: 'CLE', number: 11, price: 10000000, hr: 28, avg: 0.278, rbi: 95, runs: 85, sb: 22 },
  { name: 'Emmanuel Clase', position: 'P', team: 'CLE', number: 48, price: 3500000, wins: 2, losses: 1, era: 1.85, saves: 42, strikeouts: 62 },
  
  // Twins
  { name: 'Royce Lewis', position: '3B', team: 'MIN', number: 23, price: 4500000, hr: 18, avg: 0.295, rbi: 55, runs: 50, sb: 5 },
  { name: 'Byron Buxton', position: 'OF', team: 'MIN', number: 25, price: 5500000, hr: 22, avg: 0.258, rbi: 55, runs: 60, sb: 10 },
  
  // Royals
  { name: 'Bobby Witt Jr.', position: 'SS', team: 'KC', number: 7, price: 7000000, hr: 30, avg: 0.276, rbi: 96, runs: 105, sb: 35 },
  { name: 'Salvador Perez', position: 'C', team: 'KC', number: 13, price: 4000000, hr: 23, avg: 0.255, rbi: 70, runs: 45, sb: 0 },
  
  // Cubs
  { name: 'Cody Bellinger', position: 'OF', team: 'CHC', number: 24, price: 4800000, hr: 26, avg: 0.266, rbi: 97, runs: 85, sb: 10 },
  { name: 'Dansby Swanson', position: 'SS', team: 'CHC', number: 7, price: 4500000, hr: 22, avg: 0.244, rbi: 81, runs: 75, sb: 8 },
  
  // Reds
  { name: 'Elly De La Cruz', position: 'SS', team: 'CIN', number: 44, price: 5500000, hr: 13, avg: 0.235, rbi: 44, runs: 65, sb: 35 },
  { name: 'Hunter Greene', position: 'P', team: 'CIN', number: 21, price: 4500000, wins: 10, losses: 9, era: 3.85, saves: 0, strikeouts: 188 },
  
  // Cardinals
  { name: 'Paul Goldschmidt', position: '1B', team: 'STL', number: 46, price: 4500000, hr: 25, avg: 0.268, rbi: 80, runs: 75, sb: 5 },
  { name: 'Nolan Arenado', position: '3B', team: 'STL', number: 28, price: 4800000, hr: 26, avg: 0.266, rbi: 93, runs: 65, sb: 2 },
  
  // Brewers
  { name: 'Christian Yelich', position: 'OF', team: 'MIL', number: 22, price: 4200000, hr: 19, avg: 0.276, rbi: 76, runs: 85, sb: 28 },
  { name: 'Devin Williams', position: 'P', team: 'MIL', number: 38, price: 3500000, wins: 2, losses: 1, era: 1.85, saves: 36, strikeouts: 68 },
  
  // Marlins
  { name: 'Luis Arraez', position: '2B', team: 'MIA', number: 3, price: 6000000, hr: 3, avg: 0.350, rbi: 45, runs: 70, sb: 3 },
  { name: 'Sandy Alcantara', position: 'P', team: 'MIA', number: 22, price: 6500000, wins: 12, losses: 10, era: 3.65, saves: 0, strikeouts: 178 },
]

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')
  
  // Crear equipos
  console.log('📦 Creando equipos...')
  for (const team of MLB_TEAMS) {
    await prisma.mLBTeam.create({
      data: {
        name: team.name,
        shortName: team.shortName,
        city: team.city,
        division: team.division,
        logo: team.logo,
        wins: team.wins,
        losses: team.losses,
      }
    })
  }
  console.log(`✅ ${MLB_TEAMS.length} equipos creados`)
  
  // Obtener mapa de equipos
  const teams = await prisma.mLBTeam.findMany()
  const teamMap = new Map(teams.map(t => [t.shortName, t.id]))
  
  // Crear jugadores
  console.log('⚾ Creando jugadores...')
  for (const player of MLB_PLAYERS) {
    await prisma.player.create({
      data: {
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
      }
    })
  }
  console.log(`✅ ${MLB_PLAYERS.length} jugadores creados`)
  
  // Crear usuario admin
  console.log('👑 Creando usuario admin...')
  const admin = await prisma.user.create({
    data: {
      email: 'admin@mlbfantasy.com',
      name: 'Administrador',
      role: 'admin',
      status: 'active',
      paymentStatus: 'paid',
      balance: 100000000,
      isPaid: true,
      lastPaymentDate: new Date()
    }
  })
  console.log(`✅ Admin creado: ${admin.email}`)
  
  // Crear liga
  console.log('🏆 Creando liga...')
  const league = await prisma.league.create({
    data: {
      name: 'MLB Fantasy Liga',
      description: 'Liga principal de MLB Fantasy Cuba',
      createdBy: admin.id,
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
  console.log(`✅ Liga creada: ${league.name}`)
  
  // Crear temporada
  console.log('📅 Creando temporada...')
  const season = await prisma.season.create({
    data: {
      name: `Temporada ${new Date().getFullYear()}`,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 8)),
      status: 'active',
      currentWeek: 1,
      marketOpen: true
    }
  })
  console.log(`✅ Temporada creada: ${season.name}`)
  
  console.log('\n🎉 ¡Seed completado exitosamente!')
  console.log(`📊 Resumen:`)
  console.log(`   - Equipos: ${MLB_TEAMS.length}`)
  console.log(`   - Jugadores: ${MLB_PLAYERS.length}`)
  console.log(`   - Usuario admin: admin@mlbfantasy.com`)
  console.log(`   - Liga: ${league.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
