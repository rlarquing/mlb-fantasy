// Datos de equipos MLB para seed
export const MLB_TEAMS = [
  // American League East
  { name: "New York Yankees", shortName: "NYY", city: "New York", division: "AL East", logo: "⚾", wins: 82, losses: 60 },
  { name: "Boston Red Sox", shortName: "BOS", city: "Boston", division: "AL East", logo: "🧦", wins: 78, losses: 64 },
  { name: "Toronto Blue Jays", shortName: "TOR", city: "Toronto", division: "AL East", logo: "🐦", wins: 75, losses: 67 },
  { name: "Tampa Bay Rays", shortName: "TB", city: "Tampa Bay", division: "AL East", logo: "☀️", wins: 80, losses: 62 },
  { name: "Baltimore Orioles", shortName: "BAL", city: "Baltimore", division: "AL East", logo: "🦅", wins: 85, losses: 57 },
  
  // American League Central
  { name: "Chicago White Sox", shortName: "CWS", city: "Chicago", division: "AL Central", logo: "⚾", wins: 65, losses: 77 },
  { name: "Cleveland Guardians", shortName: "CLE", city: "Cleveland", division: "AL Central", logo: "🛡️", wins: 76, losses: 66 },
  { name: "Detroit Tigers", shortName: "DET", city: "Detroit", division: "AL Central", logo: "🐅", wins: 68, losses: 74 },
  { name: "Kansas City Royals", shortName: "KC", city: "Kansas City", division: "AL Central", logo: "👑", wins: 72, losses: 70 },
  { name: "Minnesota Twins", shortName: "MIN", city: "Minnesota", division: "AL Central", logo: "♊", wins: 78, losses: 64 },
  
  // American League West
  { name: "Houston Astros", shortName: "HOU", city: "Houston", division: "AL West", logo: "🚀", wins: 88, losses: 54 },
  { name: "Seattle Mariners", shortName: "SEA", city: "Seattle", division: "AL West", logo: "⚓", wins: 82, losses: 60 },
  { name: "Texas Rangers", shortName: "TEX", city: "Texas", division: "AL West", logo: "⭐", wins: 86, losses: 56 },
  { name: "Los Angeles Angels", shortName: "LAA", city: "Anaheim", division: "AL West", logo: "😇", wins: 72, losses: 70 },
  { name: "Oakland Athletics", shortName: "OAK", city: "Oakland", division: "AL West", logo: "🐘", wins: 55, losses: 87 },
  
  // National League East
  { name: "Atlanta Braves", shortName: "ATL", city: "Atlanta", division: "NL East", logo: "🪶", wins: 90, losses: 52 },
  { name: "Philadelphia Phillies", shortName: "PHI", city: "Philadelphia", division: "NL East", logo: "🔔", wins: 84, losses: 58 },
  { name: "New York Mets", shortName: "NYM", city: "New York", division: "NL East", logo: "🍎", wins: 76, losses: 66 },
  { name: "Miami Marlins", shortName: "MIA", city: "Miami", division: "NL East", logo: "🐟", wins: 62, losses: 80 },
  { name: "Washington Nationals", shortName: "WSH", city: "Washington", division: "NL East", logo: "🏛️", wins: 58, losses: 84 },
  
  // National League Central
  { name: "Milwaukee Brewers", shortName: "MIL", city: "Milwaukee", division: "NL Central", logo: "🍺", wins: 84, losses: 58 },
  { name: "St. Louis Cardinals", shortName: "STL", city: "St. Louis", division: "NL Central", logo: "🐦", wins: 78, losses: 64 },
  { name: "Chicago Cubs", shortName: "CHC", city: "Chicago", division: "NL Central", logo: "🐻", wins: 75, losses: 67 },
  { name: "Cincinnati Reds", shortName: "CIN", city: "Cincinnati", division: "NL Central", logo: "🔴", wins: 70, losses: 72 },
  { name: "Pittsburgh Pirates", shortName: "PIT", city: "Pittsburgh", division: "NL Central", logo: "🏴‍☠️", wins: 65, losses: 77 },
  
  // National League West
  { name: "Los Angeles Dodgers", shortName: "LAD", city: "Los Angeles", division: "NL West", logo: "💎", wins: 95, losses: 47 },
  { name: "San Diego Padres", shortName: "SD", city: "San Diego", division: "NL West", logo: "🧭", wins: 82, losses: 60 },
  { name: "San Francisco Giants", shortName: "SF", city: "San Francisco", division: "NL West", logo: "🌉", wins: 76, losses: 66 },
  { name: "Arizona Diamondbacks", shortName: "ARI", city: "Phoenix", division: "NL West", logo: "🐍", wins: 84, losses: 58 },
  { name: "Colorado Rockies", shortName: "COL", city: "Denver", division: "NL West", logo: "⛰️", wins: 55, losses: 87 },
];

// Generar partidos de ejemplo para hoy
export function generateTodayGames(teams: typeof MLB_TEAMS) {
  const today = new Date();
  const games = [];
  
  const matchups = [
    [0, 15],   // NYY vs ATL
    [3, 26],   // TB vs LAD
    [10, 21],  // HOU vs MIL
    [12, 1],   // TEX vs BOS
    [4, 9],    // BAL vs MIN
    [16, 27],  // PHI vs SD
    [5, 22],   // CWS vs STL
    [11, 19],  // SEA vs MIA
  ];
  
  matchups.forEach((matchup, index) => {
    const homeTeam = teams[matchup[1]];
    const awayTeam = teams[matchup[0]];
    const hour = 12 + (index * 2);
    
    games.push({
      id: `game-${index + 1}`,
      homeTeam,
      awayTeam,
      gameDate: new Date(today.setHours(hour, 0, 0, 0)),
      stadium: `${homeTeam.city} Stadium`,
      status: hour < 18 ? 'live' : 'scheduled',
      homeScore: hour < 18 ? Math.floor(Math.random() * 8) : null,
      awayScore: hour < 18 ? Math.floor(Math.random() * 8) : null,
    });
  });
  
  return games;
}
