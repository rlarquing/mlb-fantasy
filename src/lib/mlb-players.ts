// Jugadores MLB con precios para el sistema de fichajes
export const MLB_PLAYERS = [
  // === JUGADORES ESTRELLA (Muy caros - $15-30 millones) ===
  { name: "Shohei Ohtani", position: "P/DH", team: "LAD", number: 17, price: 30000000, isStar: true, hr: 44, avg: 0.304, rbi: 95 },
  { name: "Aaron Judge", position: "OF", team: "NYY", number: 99, price: 28000000, isStar: true, hr: 58, avg: 0.271, rbi: 144 },
  { name: "Mookie Betts", position: "OF", team: "LAD", number: 50, price: 25000000, isStar: true, hr: 39, avg: 0.307, rbi: 107 },
  { name: "Ronald Acuña Jr.", position: "OF", team: "ATL", number: 13, price: 25000000, isStar: true, hr: 41, avg: 0.337, rbi: 106 },
  { name: "Mike Trout", position: "OF", team: "LAA", number: 27, price: 24000000, isStar: true, hr: 18, avg: 0.263, rbi: 44 },
  { name: "Juan Soto", position: "OF", team: "NYY", number: 22, price: 23000000, isStar: true, hr: 35, avg: 0.275, rbi: 100 },
  { name: "Gerrit Cole", position: "P", team: "NYY", number: 45, price: 22000000, isStar: true, wins: 15, losses: 4, era: 2.63 },
  { name: "Freddie Freeman", position: "1B", team: "LAD", number: 5, price: 20000000, isStar: true, hr: 29, avg: 0.282, rbi: 102 },
  
  // === JUGADORES DE ALTO NIVEL ($10-15 millones) ===
  { name: "Bryce Harper", position: "OF", team: "PHI", number: 3, price: 15000000, isStar: true, hr: 30, avg: 0.293, rbi: 87 },
  { name: "Matt Olson", position: "1B", team: "ATL", number: 28, price: 14000000, hr: 54, avg: 0.247, rbi: 139 },
  { name: "Corey Seager", position: "SS", team: "TEX", number: 5, price: 14000000, hr: 33, avg: 0.277, rbi: 96 },
  { name: "Marcus Semien", position: "2B", team: "TEX", number: 2, price: 12000000, hr: 29, avg: 0.276, rbi: 100 },
  { name: "Trea Turner", position: "SS", team: "PHI", number: 7, price: 13000000, hr: 26, avg: 0.266, rbi: 76 },
  { name: "José Altuve", position: "2B", team: "HOU", number: 27, price: 12000000, hr: 17, avg: 0.311, rbi: 51 },
  { name: "Yordan Alvarez", position: "DH", team: "HOU", number: 44, price: 13000000, hr: 31, avg: 0.293, rbi: 97 },
  { name: "Kyle Tucker", position: "OF", team: "HOU", number: 30, price: 12000000, hr: 29, avg: 0.284, rbi: 99 },
  { name: "Francisco Lindor", position: "SS", team: "NYM", number: 12, price: 12000000, hr: 31, avg: 0.254, rbi: 98 },
  { name: "Pete Alonso", position: "1B", team: "NYM", number: 20, price: 11000000, hr: 46, avg: 0.217, rbi: 118 },
  { name: "Manny Machado", position: "3B", team: "SD", number: 13, price: 13000000, hr: 30, avg: 0.258, rbi: 91 },
  { name: "Fernando Tatis Jr.", position: "OF", team: "SD", number: 23, price: 14000000, hr: 33, avg: 0.257, rbi: 88 },
  
  // === JUGADORES DE NIVEL MEDIO ($5-10 millones) ===
  { name: "Julio Rodríguez", position: "OF", team: "SEA", number: 44, price: 9000000, hr: 32, avg: 0.275, rbi: 103 },
  { name: "Adley Rutschman", position: "C", team: "BAL", number: 35, price: 8500000, hr: 20, avg: 0.277, rbi: 80 },
  { name: "Gunnar Henderson", position: "SS", team: "BAL", number: 2, price: 8000000, hr: 28, avg: 0.255, rbi: 82 },
  { name: "Austin Riley", position: "3B", team: "ATL", number: 27, price: 8500000, hr: 37, avg: 0.255, rbi: 97 },
  { name: "Ozzie Albies", position: "2B", team: "ATL", number: 1, price: 7500000, hr: 33, avg: 0.264, rbi: 109 },
  { name: "Max Fried", position: "P", team: "ATL", number: 54, price: 9000000, wins: 14, losses: 7, era: 2.55 },
  { name: "Zack Wheeler", position: "P", team: "PHI", number: 45, price: 8500000, wins: 15, losses: 6, era: 2.57 },
  { name: "Kevin Gausman", position: "P", team: "TOR", number: 34, price: 8000000, wins: 16, losses: 9, era: 3.16 },
  { name: "Luis Castillo", position: "P", team: "SEA", number: 58, price: 8000000, wins: 14, losses: 9, era: 3.34 },
  { name: "Corbin Burnes", position: "P", team: "MIL", number: 39, price: 9000000, wins: 15, losses: 8, era: 2.94 },
  { name: "Blake Snell", position: "P", team: "SD", number: 4, price: 8500000, wins: 14, losses: 9, era: 2.25 },
  { name: "George Springer", position: "OF", team: "TOR", number: 4, price: 7000000, hr: 21, avg: 0.258, rbi: 59 },
  { name: "Bo Bichette", position: "SS", team: "TOR", number: 11, price: 8000000, hr: 20, avg: 0.262, rbi: 73 },
  { name: "Vladimir Guerrero Jr.", position: "1B", team: "TOR", number: 27, price: 8500000, hr: 26, avg: 0.264, rbi: 97 },
  { name: "Rafael Devers", position: "3B", team: "BOS", number: 11, price: 8000000, hr: 33, avg: 0.271, rbi: 100 },
  { name: "Justin Verlander", position: "P", team: "HOU", number: 35, price: 7500000, wins: 13, losses: 8, era: 3.22 },
  
  // === JUGADORES ECONÓMICOS ($2-5 millones) ===
  { name: "Jazz Chisholm Jr.", position: "OF", team: "MIA", number: 2, price: 4500000, hr: 19, avg: 0.252, rbi: 51 },
  { name: "Jorge Soler", position: "OF", team: "MIA", number: 12, price: 4000000, hr: 36, avg: 0.250, rbi: 75 },
  { name: "Luis Robert Jr.", position: "OF", team: "CWS", number: 88, price: 5000000, hr: 38, avg: 0.264, rbi: 80 },
  { name: "Dansby Swanson", position: "SS", team: "CHC", number: 7, price: 4500000, hr: 22, avg: 0.244, rbi: 81 },
  { name: "Nico Hoerner", position: "2B", team: "CHC", number: 2, price: 3500000, hr: 9, avg: 0.283, rbi: 52 },
  { name: "Cody Bellinger", position: "OF", team: "CHC", number: 24, price: 4800000, hr: 26, avg: 0.266, rbi: 97 },
  { name: "Paul Goldschmidt", position: "1B", team: "STL", number: 46, price: 4500000, hr: 25, avg: 0.268, rbi: 80 },
  { name: "Nolan Arenado", position: "3B", team: "STL", number: 28, price: 4800000, hr: 26, avg: 0.266, rbi: 93 },
  { name: "Willson Contreras", position: "C", team: "STL", number: 40, price: 4000000, hr: 19, avg: 0.264, rbi: 58 },
  { name: "Christian Yelich", position: "OF", team: "MIL", number: 22, price: 4200000, hr: 19, avg: 0.276, rbi: 76 },
  { name: "William Contreras", position: "C", team: "MIL", number: 24, price: 3500000, hr: 17, avg: 0.289, rbi: 78 },
  { name: "Walker Buehler", position: "P", team: "LAD", number: 21, price: 4000000, wins: 8, losses: 5, era: 3.45 },
  { name: "Lucas Giolito", position: "P", team: "CLE", number: 27, price: 3500000, wins: 12, losses: 9, era: 3.90 },
  { name: "Chris Sale", position: "P", team: "ATL", number: 41, price: 3800000, wins: 11, losses: 6, era: 3.28 },
  { name: "Charlie Morton", position: "P", team: "ATL", number: 50, price: 3000000, wins: 14, losses: 10, era: 3.64 },
  
  // === JUGADORES BARATOS ($1-2 millones) ===
  { name: "Eloy Jiménez", position: "DH", team: "CWS", number: 74, price: 1800000, hr: 18, avg: 0.272, rbi: 57 },
  { name: "Andrew Vaughn", position: "1B", team: "CWS", number: 25, price: 1500000, hr: 21, avg: 0.258, rbi: 70 },
  { name: "Bobby Witt Jr.", position: "SS", team: "KC", number: 7, price: 2000000, hr: 30, avg: 0.276, rbi: 96 },
  { name: "Salvador Perez", position: "C", team: "KC", number: 13, price: 1800000, hr: 23, avg: 0.255, rbi: 70 },
  { name: "Vinnie Pasquantino", position: "1B", team: "KC", number: 9, price: 1200000, hr: 18, avg: 0.282, rbi: 67 },
  { name: "Spencer Torkelson", position: "1B", team: "DET", number: 20, price: 1500000, hr: 31, avg: 0.233, rbi: 94 },
  { name: "Riley Greene", position: "OF", team: "DET", number: 31, price: 1400000, hr: 11, avg: 0.288, rbi: 37 },
  { name: "Kerry Carpenter", position: "OF", team: "DET", number: 48, price: 1200000, hr: 20, avg: 0.278, rbi: 58 },
  { name: "Ryan Mountcastle", position: "1B", team: "BAL", number: 6, price: 1600000, hr: 18, avg: 0.270, rbi: 59 },
  { name: "Anthony Santander", position: "OF", team: "BAL", number: 25, price: 1800000, hr: 28, avg: 0.254, rbi: 89 },
  { name: "Cedric Mullins", position: "OF", team: "BAL", number: 31, price: 1500000, hr: 15, avg: 0.256, rbi: 54 },
  { name: "Jeimer Candelario", position: "3B", team: "CIN", number: 46, price: 1400000, hr: 22, avg: 0.251, rbi: 66 },
  { name: "TJ Friedl", position: "OF", team: "CIN", number: 29, price: 1100000, hr: 12, avg: 0.279, rbi: 44 },
  { name: "Elly De La Cruz", position: "SS", team: "CIN", number: 44, price: 1900000, hr: 13, avg: 0.235, rbi: 44 },
  { name: "Bryan Reynolds", position: "OF", team: "PIT", number: 10, price: 1700000, hr: 24, avg: 0.267, rbi: 74 },
  { name: "Ke'Bryan Hayes", position: "3B", team: "PIT", number: 13, price: 1400000, hr: 15, avg: 0.252, rbi: 58 },
  { name: "Oneil Cruz", position: "SS", team: "PIT", number: 15, price: 1600000, hr: 15, avg: 0.250, rbi: 50 },
  
  // === JUGADORES MUY BARATOS ($500k - $1 millón) ===
  { name: "Javier Báez", position: "SS", team: "DET", number: 28, price: 900000, hr: 9, avg: 0.245, rbi: 41 },
  { name: "Jonathan Schoop", position: "2B", team: "DET", number: 7, price: 700000, hr: 7, avg: 0.235, rbi: 34 },
  { name: "Nick Senzel", position: "OF", team: "CIN", number: 15, price: 800000, hr: 8, avg: 0.245, rbi: 33 },
  { name: "Joey Wendle", position: "2B", team: "MIA", number: 18, price: 600000, hr: 2, avg: 0.238, rbi: 20 },
  { name: "Jon Berti", position: "SS", team: "MIA", number: 5, price: 550000, hr: 3, avg: 0.272, rbi: 24 },
  { name: "Garrett Hampson", position: "OF", team: "MIA", number: 1, price: 500000, hr: 4, avg: 0.250, rbi: 18 },
  { name: "Amed Rosario", position: "SS", team: "TB", number: 1, price: 850000, hr: 6, avg: 0.265, rbi: 41 },
  { name: "Isaac Paredes", position: "3B", team: "TB", number: 17, price: 750000, hr: 19, avg: 0.250, rbi: 58 },
  { name: "Josh Lowe", position: "OF", team: "TB", number: 15, price: 650000, hr: 13, avg: 0.262, rbi: 51 },
  { name: "Randy Arozarena", position: "OF", team: "TB", number: 56, price: 900000, hr: 23, avg: 0.254, rbi: 83 },
  { name: "Yandy Díaz", position: "1B", team: "TB", number: 2, price: 800000, hr: 22, avg: 0.293, rbi: 70 },
  { name: "Harold Ramírez", position: "OF", team: "TB", number: 13, price: 550000, hr: 6, avg: 0.278, rbi: 36 },
  { name: "Christian Bethancourt", position: "C", team: "TB", number: 23, price: 500000, hr: 11, avg: 0.252, rbi: 41 },
  { name: "Curtis Mead", position: "2B", team: "TB", number: 84, price: 450000, hr: 2, avg: 0.245, rbi: 10 },
  { name: "Tyrone Taylor", position: "OF", team: "MIL", number: 15, price: 600000, hr: 10, avg: 0.238, rbi: 35 },
  { name: "Brice Turang", position: "SS", team: "MIL", number: 2, price: 500000, hr: 4, avg: 0.218, rbi: 28 },
  { name: "Joey Wiemer", position: "OF", team: "MIL", number: 36, price: 550000, hr: 9, avg: 0.228, rbi: 38 },
  { name: "Andruw Monasterio", position: "3B", team: "MIL", number: 14, price: 480000, hr: 3, avg: 0.259, rbi: 21 },
  
  // === PROSPECTOS Y JUGADORES NOVEDAD ($300k - $500k) ===
  { name: "Jackson Holliday", position: "SS", team: "BAL", number: 7, price: 450000, hr: 2, avg: 0.210, rbi: 8 },
  { name: "Colton Cowser", position: "OF", team: "BAL", number: 17, price: 400000, hr: 7, avg: 0.235, rbi: 23 },
  { name: "Jordan Westburg", position: "2B", team: "BAL", number: 67, price: 420000, hr: 8, avg: 0.250, rbi: 32 },
  { name: "Heston Kjerstad", position: "OF", team: "BAL", number: 12, price: 380000, hr: 3, avg: 0.245, rbi: 12 },
  { name: "Coby Mayo", position: "3B", team: "BAL", number: 16, price: 350000, hr: 2, avg: 0.220, rbi: 6 },
  { name: "James Outman", position: "OF", team: "LAD", number: 33, price: 450000, hr: 13, avg: 0.238, rbi: 43 },
  { name: "Miguel Vargas", position: "2B", team: "LAD", number: 71, price: 400000, hr: 4, avg: 0.240, rbi: 18 },
  { name: "Michael Busch", position: "1B", team: "CHC", number: 29, price: 420000, hr: 8, avg: 0.248, rbi: 28 },
  { name: "Matt Mervis", position: "1B", team: "CHC", number: 27, price: 380000, hr: 3, avg: 0.235, rbi: 11 },
  { name: "Peyton Burdick", position: "OF", team: "MIA", number: 26, price: 320000, hr: 6, avg: 0.225, rbi: 18 },
  { name: "Xavier Edwards", position: "SS", team: "MIA", number: 28, price: 350000, hr: 1, avg: 0.280, rbi: 9 },
  { name: "Jonah Bride", position: "3B", team: "MIA", number: 40, price: 300000, hr: 3, avg: 0.245, rbi: 14 },
  { name: "Kyle Manzardo", position: "1B", team: "CLE", number: 9, price: 380000, hr: 5, avg: 0.235, rbi: 18 },
  { name: "Jhonkensy Noel", position: "OF", team: "CLE", number: 43, price: 350000, hr: 4, avg: 0.242, rbi: 16 },
  { name: "Nolan Jones", position: "OF", team: "CLE", number: 20, price: 400000, hr: 7, avg: 0.250, rbi: 28 },
  { name: "Tyler Freeman", position: "SS", team: "CLE", number: 2, price: 320000, hr: 2, avg: 0.245, rbi: 12 },
  { name: "Trevor Larnach", position: "OF", team: "MIN", number: 24, price: 450000, hr: 8, avg: 0.235, rbi: 32 },
  { name: "Matt Wallner", position: "OF", team: "MIN", number: 67, price: 400000, hr: 9, avg: 0.230, rbi: 30 },
  { name: "Edouard Julien", position: "2B", team: "MIN", number: 47, price: 380000, hr: 6, avg: 0.245, rbi: 24 },
  { name: "Brooks Lee", position: "SS", team: "MIN", number: 72, price: 350000, hr: 2, avg: 0.238, rbi: 10 },
];

// Función para obtener jugadores por posición
export const getPlayersByPosition = (position: string) => {
  return MLB_PLAYERS.filter(p => p.position.includes(position));
};

// Función para obtener jugadores por rango de precio
export const getPlayersByPriceRange = (min: number, max: number) => {
  return MLB_PLAYERS.filter(p => p.price >= min && p.price <= max);
};

// Función para obtener jugadores estrella
export const getStarPlayers = () => {
  return MLB_PLAYERS.filter(p => p.isStar);
};

// Formatear precio en pesos colombianos
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};
