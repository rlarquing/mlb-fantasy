// Jugadores MLB completos - 30 equipos con roster real
export const MLB_PLAYERS = [
  // ============== NEW YORK YANKEES (NYY) ==============
  { name: "Aaron Judge", position: "OF", team: "NYY", number: 99, price: 28000000, isStar: true, hr: 58, avg: 0.271, rbi: 144, runs: 122, sb: 10 },
  { name: "Juan Soto", position: "OF", team: "NYY", number: 22, price: 23000000, isStar: true, hr: 35, avg: 0.275, rbi: 100, runs: 110, sb: 5 },
  { name: "Giancarlo Stanton", position: "DH", team: "NYY", number: 27, price: 8000000, hr: 26, avg: 0.238, rbi: 70, runs: 45, sb: 0 },
  { name: "Gerrit Cole", position: "P", team: "NYY", number: 45, price: 22000000, isStar: true, wins: 15, losses: 4, era: 2.63, saves: 0, strikeouts: 222 },
  { name: "Anthony Rizzo", position: "1B", team: "NYY", number: 48, price: 5000000, hr: 12, avg: 0.253, rbi: 48, runs: 45, sb: 1 },
  { name: "Gleyber Torres", position: "2B", team: "NYY", number: 25, price: 4500000, hr: 15, avg: 0.267, rbi: 55, runs: 65, sb: 8 },
  { name: "Anthony Volpe", position: "SS", team: "NYY", number: 11, price: 3500000, hr: 12, avg: 0.242, rbi: 45, runs: 75, sb: 24 },
  { name: "Alex Verdugo", position: "OF", team: "NYY", number: 24, price: 3000000, hr: 8, avg: 0.268, rbi: 45, runs: 55, sb: 4 },
  { name: "Jose Trevino", position: "C", team: "NYY", number: 39, price: 2000000, hr: 5, avg: 0.242, rbi: 28, runs: 20, sb: 0 },
  { name: "Nestor Cortes", position: "P", team: "NYY", number: 65, price: 4500000, wins: 9, losses: 6, era: 3.77, saves: 0, strikeouts: 126 },
  { name: "Marcus Stroman", position: "P", team: "NYY", number: 0, price: 4000000, wins: 10, losses: 8, era: 3.95, saves: 0, strikeouts: 108 },
  { name: "Clay Holmes", position: "P", team: "NYY", number: 35, price: 2500000, wins: 1, losses: 2, era: 2.85, saves: 30, strikeouts: 55 },
  
  // ============== BOSTON RED SOX (BOS) ==============
  { name: "Rafael Devers", position: "3B", team: "BOS", number: 11, price: 8000000, hr: 33, avg: 0.271, rbi: 100, runs: 85, sb: 2 },
  { name: "Jarren Duran", position: "OF", team: "BOS", number: 16, price: 4000000, hr: 15, avg: 0.285, rbi: 55, runs: 95, sb: 28 },
  { name: "Triston Casas", position: "1B", team: "BOS", number: 36, price: 3500000, hr: 22, avg: 0.258, rbi: 65, runs: 50, sb: 0 },
  { name: "Trevor Story", position: "SS", team: "BOS", number: 10, price: 5000000, hr: 15, avg: 0.248, rbi: 50, runs: 55, sb: 12 },
  { name: "Connor Wong", position: "C", team: "BOS", number: 12, price: 1500000, hr: 9, avg: 0.255, rbi: 36, runs: 30, sb: 1 },
  { name: "Brayan Bello", position: "P", team: "BOS", number: 66, price: 3500000, wins: 12, losses: 9, era: 4.02, saves: 0, strikeouts: 145 },
  { name: "Kutter Crawford", position: "P", team: "BOS", number: 50, price: 2000000, wins: 8, losses: 10, era: 4.28, saves: 0, strikeouts: 138 },
  { name: "Kenley Jansen", position: "P", team: "BOS", number: 74, price: 3000000, wins: 2, losses: 3, era: 3.25, saves: 27, strikeouts: 52 },
  
  // ============== TAMPA BAY RAYS (TB) ==============
  { name: "Yandy Diaz", position: "1B", team: "TB", number: 2, price: 5000000, hr: 22, avg: 0.293, rbi: 70, runs: 65, sb: 0 },
  { name: "Randy Arozarena", position: "OF", team: "TB", number: 56, price: 5500000, hr: 23, avg: 0.254, rbi: 83, runs: 75, sb: 20 },
  { name: "Isaac Paredes", position: "3B", team: "TB", number: 17, price: 3500000, hr: 19, avg: 0.250, rbi: 58, runs: 50, sb: 0 },
  { name: "Jose Siri", position: "OF", team: "TB", number: 4, price: 2500000, hr: 17, avg: 0.222, rbi: 45, runs: 55, sb: 12 },
  { name: "Wander Franco", position: "SS", team: "TB", number: 5, price: 4500000, hr: 10, avg: 0.281, rbi: 45, runs: 60, sb: 18 },
  { name: "Shane McClanahan", position: "P", team: "TB", number: 18, price: 6000000, wins: 11, losses: 5, era: 3.22, saves: 0, strikeouts: 156 },
  { name: "Zach Eflin", position: "P", team: "TB", number: 24, price: 4000000, wins: 13, losses: 8, era: 3.88, saves: 0, strikeouts: 134 },
  { name: "Pete Fairbanks", position: "P", team: "TB", number: 29, price: 2000000, wins: 1, losses: 2, era: 2.58, saves: 25, strikeouts: 48 },
  
  // ============== TORONTO BLUE JAYS (TOR) ==============
  { name: "Vladimir Guerrero Jr.", position: "1B", team: "TOR", number: 27, price: 8500000, hr: 26, avg: 0.264, rbi: 97, runs: 75, sb: 2 },
  { name: "Bo Bichette", position: "SS", team: "TOR", number: 11, price: 8000000, hr: 20, avg: 0.262, rbi: 73, runs: 80, sb: 6 },
  { name: "George Springer", position: "OF", team: "TOR", number: 4, price: 7000000, hr: 21, avg: 0.258, rbi: 59, runs: 72, sb: 7 },
  { name: "Daulton Varsho", position: "OF", team: "TOR", number: 10, price: 4500000, hr: 20, avg: 0.223, rbi: 55, runs: 60, sb: 10 },
  { name: "Alejandro Kirk", position: "C", team: "TOR", number: 85, price: 2500000, hr: 7, avg: 0.263, rbi: 35, runs: 30, sb: 0 },
  { name: "Kevin Gausman", position: "P", team: "TOR", number: 34, price: 8000000, wins: 16, losses: 9, era: 3.16, saves: 0, strikeouts: 215 },
  { name: "Jose Berrios", position: "P", team: "TOR", number: 17, price: 5500000, wins: 11, losses: 10, era: 3.85, saves: 0, strikeouts: 148 },
  { name: "Jordan Romano", position: "P", team: "TOR", number: 59, price: 2500000, wins: 2, losses: 3, era: 2.95, saves: 30, strikeouts: 55 },
  
  // ============== BALTIMORE ORIOLES (BAL) ==============
  { name: "Gunnar Henderson", position: "SS", team: "BAL", number: 2, price: 8000000, hr: 28, avg: 0.255, rbi: 82, runs: 95, sb: 10 },
  { name: "Adley Rutschman", position: "C", team: "BAL", number: 35, price: 8500000, hr: 20, avg: 0.277, rbi: 80, runs: 75, sb: 1 },
  { name: "Anthony Santander", position: "OF", team: "BAL", number: 25, price: 5000000, hr: 28, avg: 0.254, rbi: 89, runs: 65, sb: 0 },
  { name: "Ryan Mountcastle", position: "1B", team: "BAL", number: 6, price: 4000000, hr: 18, avg: 0.270, rbi: 59, runs: 50, sb: 1 },
  { name: "Cedric Mullins", position: "OF", team: "BAL", number: 31, price: 3500000, hr: 15, avg: 0.256, rbi: 54, runs: 68, sb: 18 },
  { name: "Corbin Burnes", position: "P", team: "BAL", number: 39, price: 9000000, wins: 15, losses: 8, era: 2.94, saves: 0, strikeouts: 198 },
  { name: "Kyle Bradish", position: "P", team: "BAL", number: 52, price: 3000000, wins: 12, losses: 7, era: 3.25, saves: 0, strikeouts: 148 },
  { name: "Craig Kimbrel", position: "P", team: "BAL", number: 74, price: 2500000, wins: 3, losses: 2, era: 3.35, saves: 28, strikeouts: 62 },
  
  // ============== CHICAGO WHITE SOX (CWS) ==============
  { name: "Luis Robert Jr.", position: "OF", team: "CWS", number: 88, price: 5000000, hr: 38, avg: 0.264, rbi: 80, runs: 75, sb: 8 },
  { name: "Andrew Vaughn", position: "1B", team: "CWS", number: 25, price: 2500000, hr: 21, avg: 0.258, rbi: 70, runs: 45, sb: 0 },
  { name: "Eloy Jimenez", position: "DH", team: "CWS", number: 74, price: 3000000, hr: 18, avg: 0.272, rbi: 57, runs: 40, sb: 0 },
  { name: "Yoan Moncada", position: "3B", team: "CWS", number: 10, price: 2500000, hr: 8, avg: 0.260, rbi: 35, runs: 30, sb: 2 },
  { name: "Dylan Cease", position: "P", team: "CWS", number: 84, price: 4500000, wins: 10, losses: 10, era: 4.22, saves: 0, strikeouts: 186 },
  { name: "Michael Kopech", position: "P", team: "CWS", number: 34, price: 2000000, wins: 5, losses: 10, era: 4.85, saves: 0, strikeouts: 128 },
  
  // ============== CLEVELAND GUARDIANS (CLE) ==============
  { name: "Jose Ramirez", position: "3B", team: "CLE", number: 11, price: 10000000, hr: 28, avg: 0.278, rbi: 95, runs: 85, sb: 22 },
  { name: "Josh Naylor", position: "1B", team: "CLE", number: 22, price: 4500000, hr: 17, avg: 0.273, rbi: 72, runs: 50, sb: 1 },
  { name: "Steven Kwan", position: "OF", team: "CLE", number: 38, price: 3500000, hr: 6, avg: 0.298, rbi: 45, runs: 75, sb: 8 },
  { name: "Andres Gimenez", position: "SS", team: "CLE", number: 0, price: 3000000, hr: 12, avg: 0.261, rbi: 48, runs: 65, sb: 20 },
  { name: "Shane Bieber", position: "P", team: "CLE", number: 57, price: 5500000, wins: 11, losses: 6, era: 3.52, saves: 0, strikeouts: 142 },
  { name: "Tanner Bibee", position: "P", team: "CLE", number: 56, price: 3000000, wins: 12, losses: 8, era: 3.85, saves: 0, strikeouts: 155 },
  { name: "Emmanuel Clase", position: "P", team: "CLE", number: 48, price: 3500000, wins: 2, losses: 1, era: 1.85, saves: 42, strikeouts: 62 },
  
  // ============== DETROIT TIGERS (DET) ==============
  { name: "Spencer Torkelson", position: "1B", team: "DET", number: 20, price: 2500000, hr: 31, avg: 0.233, rbi: 94, runs: 60, sb: 0 },
  { name: "Riley Greene", position: "OF", team: "DET", number: 31, price: 2800000, hr: 11, avg: 0.288, rbi: 37, runs: 50, sb: 5 },
  { name: "Kerry Carpenter", position: "OF", team: "DET", number: 48, price: 2000000, hr: 20, avg: 0.278, rbi: 58, runs: 45, sb: 0 },
  { name: "Javier Baez", position: "SS", team: "DET", number: 28, price: 2500000, hr: 9, avg: 0.245, rbi: 41, runs: 35, sb: 6 },
  { name: "Tarik Skubal", position: "P", team: "DET", number: 29, price: 4000000, wins: 14, losses: 6, era: 2.95, saves: 0, strikeouts: 178 },
  { name: "Eduardo Rodriguez", position: "P", team: "DET", number: 57, price: 3000000, wins: 10, losses: 9, era: 3.88, saves: 0, strikeouts: 132 },
  
  // ============== KANSAS CITY ROYALS (KC) ==============
  { name: "Bobby Witt Jr.", position: "SS", team: "KC", number: 7, price: 7000000, hr: 30, avg: 0.276, rbi: 96, runs: 105, sb: 35 },
  { name: "Salvador Perez", position: "C", team: "KC", number: 13, price: 4000000, hr: 23, avg: 0.255, rbi: 70, runs: 45, sb: 0 },
  { name: "Vinnie Pasquantino", position: "1B", team: "KC", number: 9, price: 2500000, hr: 18, avg: 0.282, rbi: 67, runs: 45, sb: 0 },
  { name: "Maikel Garcia", position: "3B", team: "KC", number: 11, price: 1500000, hr: 6, avg: 0.276, rbi: 45, runs: 65, sb: 15 },
  { name: "Cole Ragans", position: "P", team: "KC", number: 55, price: 3500000, wins: 11, losses: 8, era: 3.45, saves: 0, strikeouts: 175 },
  { name: "Brady Singer", position: "P", team: "KC", number: 51, price: 2500000, wins: 9, losses: 11, era: 4.28, saves: 0, strikeouts: 138 },
  
  // ============== MINNESOTA TWINS (MIN) ==============
  { name: "Royce Lewis", position: "3B", team: "MIN", number: 23, price: 4500000, hr: 18, avg: 0.295, rbi: 55, runs: 50, sb: 5 },
  { name: "Byron Buxton", position: "OF", team: "MIN", number: 25, price: 5500000, hr: 22, avg: 0.258, rbi: 55, runs: 60, sb: 10 },
  { name: "Carlos Correa", position: "SS", team: "MIN", number: 4, price: 6000000, hr: 18, avg: 0.263, rbi: 65, runs: 55, sb: 3 },
  { name: "Max Kepler", position: "OF", team: "MIN", number: 26, price: 3500000, hr: 24, avg: 0.248, rbi: 65, runs: 55, sb: 2 },
  { name: "Pablo Lopez", position: "P", team: "MIN", number: 49, price: 5000000, wins: 13, losses: 9, era: 3.68, saves: 0, strikeouts: 188 },
  { name: "Sonny Gray", position: "P", team: "MIN", number: 54, price: 5500000, wins: 11, losses: 8, era: 3.52, saves: 0, strikeouts: 165 },
  { name: "Jhoan Duran", position: "P", team: "MIN", number: 59, price: 2500000, wins: 2, losses: 2, era: 2.35, saves: 28, strikeouts: 58 },
  
  // ============== HOUSTON ASTROS (HOU) ==============
  { name: "Yordan Alvarez", position: "DH", team: "HOU", number: 44, price: 13000000, hr: 31, avg: 0.293, rbi: 97, runs: 75, sb: 0 },
  { name: "Kyle Tucker", position: "OF", team: "HOU", number: 30, price: 12000000, hr: 29, avg: 0.284, rbi: 99, runs: 85, sb: 15 },
  { name: "Jose Altuve", position: "2B", team: "HOU", number: 27, price: 12000000, hr: 17, avg: 0.311, rbi: 51, runs: 85, sb: 15 },
  { name: "Alex Bregman", position: "3B", team: "HOU", number: 2, price: 8000000, hr: 25, avg: 0.267, rbi: 85, runs: 80, sb: 4 },
  { name: "Jeremy Pena", position: "SS", team: "HOU", number: 3, price: 4500000, hr: 10, avg: 0.268, rbi: 52, runs: 70, sb: 8 },
  { name: "Yainer Diaz", position: "C", team: "HOU", number: 21, price: 2500000, hr: 16, avg: 0.285, rbi: 50, runs: 35, sb: 0 },
  { name: "Framber Valdez", position: "P", team: "HOU", number: 59, price: 6500000, wins: 15, losses: 8, era: 3.25, saves: 0, strikeouts: 185 },
  { name: "Justin Verlander", position: "P", team: "HOU", number: 35, price: 7500000, wins: 13, losses: 8, era: 3.22, saves: 0, strikeouts: 155 },
  { name: "Josh Hader", position: "P", team: "HOU", number: 71, price: 4500000, wins: 2, losses: 1, era: 2.45, saves: 32, strikeouts: 68 },
  
  // ============== SEATTLE MARINERS (SEA) ==============
  { name: "Julio Rodriguez", position: "OF", team: "SEA", number: 44, price: 9000000, hr: 32, avg: 0.275, rbi: 103, runs: 95, sb: 25 },
  { name: "Cal Raleigh", position: "C", team: "SEA", number: 29, price: 4500000, hr: 30, avg: 0.235, rbi: 75, runs: 55, sb: 0 },
  { name: "Eugenio Suarez", position: "3B", team: "SEA", number: 28, price: 4000000, hr: 22, avg: 0.232, rbi: 72, runs: 55, sb: 2 },
  { name: "J.P. Crawford", position: "SS", team: "SEA", number: 3, price: 2500000, hr: 6, avg: 0.262, rbi: 45, runs: 65, sb: 5 },
  { name: "Luis Castillo", position: "P", team: "SEA", number: 58, price: 8000000, wins: 14, losses: 9, era: 3.34, saves: 0, strikeouts: 195 },
  { name: "George Kirby", position: "P", team: "SEA", number: 68, price: 5500000, wins: 13, losses: 8, era: 3.52, saves: 0, strikeouts: 168 },
  { name: "Andres Munoz", position: "P", team: "SEA", number: 75, price: 2500000, wins: 2, losses: 2, era: 2.45, saves: 25, strikeouts: 65 },
  
  // ============== TEXAS RANGERS (TEX) ==============
  { name: "Corey Seager", position: "SS", team: "TEX", number: 5, price: 14000000, hr: 33, avg: 0.277, rbi: 96, runs: 80, sb: 2 },
  { name: "Marcus Semien", position: "2B", team: "TEX", number: 2, price: 12000000, hr: 29, avg: 0.276, rbi: 100, runs: 95, sb: 12 },
  { name: "Adolis Garcia", position: "OF", team: "TEX", number: 53, price: 6500000, hr: 36, avg: 0.254, rbi: 98, runs: 75, sb: 8 },
  { name: "Nathaniel Lowe", position: "1B", team: "TEX", number: 30, price: 4000000, hr: 17, avg: 0.278, rbi: 65, runs: 55, sb: 0 },
  { name: "Jonah Heim", position: "C", team: "TEX", number: 28, price: 2500000, hr: 16, avg: 0.262, rbi: 58, runs: 40, sb: 0 },
  { name: "Nathan Eovaldi", position: "P", team: "TEX", number: 17, price: 5000000, wins: 14, losses: 7, era: 3.75, saves: 0, strikeouts: 162 },
  { name: "Jordan Montgomery", position: "P", team: "TEX", number: 52, price: 4500000, wins: 11, losses: 9, era: 3.85, saves: 0, strikeouts: 148 },
  { name: "Jose Leclerc", position: "P", team: "TEX", number: 55, price: 2000000, wins: 1, losses: 2, era: 2.85, saves: 22, strikeouts: 52 },
  
  // ============== LOS ANGELES ANGELS (LAA) ==============
  { name: "Mike Trout", position: "OF", team: "LAA", number: 27, price: 24000000, isStar: true, hr: 18, avg: 0.263, rbi: 44, runs: 45, sb: 2 },
  { name: "Shohei Ohtani", position: "DH", team: "LAA", number: 17, price: 30000000, isStar: true, hr: 44, avg: 0.304, rbi: 95, runs: 102, sb: 18 },
  { name: "Taylor Ward", position: "OF", team: "LAA", number: 3, price: 3000000, hr: 18, avg: 0.268, rbi: 55, runs: 55, sb: 3 },
  { name: "Brandon Drury", position: "2B", team: "LAA", number: 23, price: 2500000, hr: 16, avg: 0.268, rbi: 55, runs: 45, sb: 2 },
  { name: "Logan O'Hoppe", position: "C", team: "LAA", number: 14, price: 2000000, hr: 12, avg: 0.255, rbi: 40, runs: 35, sb: 0 },
  { name: "Patrick Sandoval", position: "P", team: "LAA", number: 43, price: 2500000, wins: 8, losses: 10, era: 4.15, saves: 0, strikeouts: 138 },
  { name: "Reid Detmers", position: "P", team: "LAA", number: 32, price: 2000000, wins: 6, losses: 10, era: 4.45, saves: 0, strikeouts: 132 },
  
  // ============== OAKLAND ATHLETICS (OAK) ==============
  { name: "Brent Rooker", position: "DH", team: "OAK", number: 25, price: 2500000, hr: 30, avg: 0.255, rbi: 72, runs: 60, sb: 2 },
  { name: "Zack Gelof", position: "2B", team: "OAK", number: 20, price: 2000000, hr: 17, avg: 0.255, rbi: 50, runs: 60, sb: 15 },
  { name: "JJ Bleday", position: "OF", team: "OAK", number: 18, price: 1500000, hr: 16, avg: 0.248, rbi: 45, runs: 45, sb: 2 },
  { name: "Shea Langeliers", position: "C", team: "OAK", number: 23, price: 1500000, hr: 16, avg: 0.235, rbi: 48, runs: 35, sb: 0 },
  { name: "Paul Blackburn", position: "P", team: "OAK", number: 58, price: 1500000, wins: 6, losses: 9, era: 4.35, saves: 0, strikeouts: 98 },
  
  // ============== ATLANTA BRAVES (ATL) ==============
  { name: "Ronald Acuna Jr.", position: "OF", team: "ATL", number: 13, price: 25000000, isStar: true, hr: 41, avg: 0.337, rbi: 106, runs: 149, sb: 73 },
  { name: "Matt Olson", position: "1B", team: "ATL", number: 28, price: 14000000, hr: 54, avg: 0.247, rbi: 139, runs: 105, sb: 4 },
  { name: "Austin Riley", position: "3B", team: "ATL", number: 27, price: 8500000, hr: 37, avg: 0.255, rbi: 97, runs: 85, sb: 0 },
  { name: "Ozzie Albies", position: "2B", team: "ATL", number: 1, price: 7500000, hr: 33, avg: 0.264, rbi: 109, runs: 85, sb: 10 },
  { name: "Sean Murphy", position: "C", team: "ATL", number: 12, price: 5500000, hr: 21, avg: 0.268, rbi: 68, runs: 50, sb: 0 },
  { name: "Marcell Ozuna", position: "DH", team: "ATL", number: 20, price: 4500000, hr: 40, avg: 0.268, rbi: 100, runs: 75, sb: 0 },
  { name: "Max Fried", position: "P", team: "ATL", number: 54, price: 9000000, wins: 14, losses: 7, era: 2.55, saves: 0, strikeouts: 165 },
  { name: "Spencer Strider", position: "P", team: "ATL", number: 65, price: 8500000, wins: 16, losses: 5, era: 3.15, saves: 0, strikeouts: 245 },
  { name: "Raisel Iglesias", position: "P", team: "ATL", number: 26, price: 3500000, wins: 2, losses: 1, era: 2.35, saves: 32, strikeouts: 58 },
  
  // ============== PHILADELPHIA PHILLIES (PHI) ==============
  { name: "Bryce Harper", position: "1B", team: "PHI", number: 3, price: 15000000, isStar: true, hr: 30, avg: 0.293, rbi: 87, runs: 85, sb: 5 },
  { name: "Trea Turner", position: "SS", team: "PHI", number: 7, price: 13000000, hr: 26, avg: 0.266, rbi: 76, runs: 95, sb: 28 },
  { name: "Kyle Schwarber", position: "OF", team: "PHI", number: 12, price: 7000000, hr: 47, avg: 0.218, rbi: 98, runs: 95, sb: 3 },
  { name: "J.T. Realmuto", position: "C", team: "PHI", number: 10, price: 6000000, hr: 18, avg: 0.275, rbi: 62, runs: 65, sb: 15 },
  { name: "Nick Castellanos", position: "OF", team: "PHI", number: 8, price: 5500000, hr: 26, avg: 0.268, rbi: 85, runs: 70, sb: 2 },
  { name: "Alec Bohm", position: "3B", team: "PHI", number: 28, price: 3500000, hr: 18, avg: 0.285, rbi: 72, runs: 55, sb: 0 },
  { name: "Zack Wheeler", position: "P", team: "PHI", number: 45, price: 8500000, wins: 15, losses: 6, era: 2.57, saves: 0, strikeouts: 212 },
  { name: "Aaron Nola", position: "P", team: "PHI", number: 27, price: 6500000, wins: 13, losses: 9, era: 3.72, saves: 0, strikeouts: 188 },
  { name: "Jose Alvarado", position: "P", team: "PHI", number: 46, price: 2500000, wins: 2, losses: 2, era: 2.65, saves: 18, strikeouts: 55 },
  
  // ============== NEW YORK METS (NYM) ==============
  { name: "Francisco Lindor", position: "SS", team: "NYM", number: 12, price: 12000000, hr: 31, avg: 0.254, rbi: 98, runs: 90, sb: 25 },
  { name: "Pete Alonso", position: "1B", team: "NYM", number: 20, price: 11000000, hr: 46, avg: 0.217, rbi: 118, runs: 85, sb: 0 },
  { name: "Brandon Nimmo", position: "OF", team: "NYM", number: 9, price: 6500000, hr: 22, avg: 0.278, rbi: 65, runs: 90, sb: 5 },
  { name: "Jeff McNeil", position: "2B", team: "NYM", number: 6, price: 4500000, hr: 10, avg: 0.285, rbi: 55, runs: 60, sb: 3 },
  { name: "Francisco Alvarez", position: "C", team: "NYM", number: 4, price: 3500000, hr: 25, avg: 0.235, rbi: 62, runs: 45, sb: 0 },
  { name: "Justin Verlander", position: "P", team: "NYM", number: 35, price: 7000000, wins: 12, losses: 9, era: 3.85, saves: 0, strikeouts: 145 },
  { name: "Kodai Senga", position: "P", team: "NYM", number: 34, price: 5500000, wins: 12, losses: 7, era: 2.98, saves: 0, strikeouts: 198 },
  { name: "Edwin Diaz", position: "P", team: "NYM", number: 39, price: 4500000, wins: 2, losses: 1, era: 2.45, saves: 30, strikeouts: 65 },
  
  // ============== MIAMI MARLINS (MIA) ==============
  { name: "Luis Arraez", position: "2B", team: "MIA", number: 3, price: 6000000, hr: 3, avg: 0.350, rbi: 45, runs: 70, sb: 3 },
  { name: "Jazz Chisholm Jr.", position: "OF", team: "MIA", number: 2, price: 4500000, hr: 19, avg: 0.252, rbi: 51, runs: 55, sb: 15 },
  { name: "Jorge Soler", position: "OF", team: "MIA", number: 12, price: 4000000, hr: 36, avg: 0.250, rbi: 75, runs: 65, sb: 1 },
  { name: "Jake Burger", position: "3B", team: "MIA", number: 21, price: 2500000, hr: 27, avg: 0.253, rbi: 68, runs: 50, sb: 0 },
  { name: "Nick Fortes", position: "C", team: "MIA", number: 54, price: 1500000, hr: 7, avg: 0.248, rbi: 28, runs: 25, sb: 0 },
  { name: "Sandy Alcantara", position: "P", team: "MIA", number: 22, price: 6500000, wins: 12, losses: 10, era: 3.65, saves: 0, strikeouts: 178 },
  { name: "Jesus Luzardo", position: "P", team: "MIA", number: 44, price: 4500000, wins: 10, losses: 9, era: 3.55, saves: 0, strikeouts: 168 },
  { name: "Tanner Scott", position: "P", team: "MIA", number: 66, price: 2000000, wins: 2, losses: 3, era: 2.85, saves: 20, strikeouts: 58 },
  
  // ============== WASHINGTON NATIONALS (WSH) ==============
  { name: "CJ Abrams", position: "SS", team: "WSH", number: 5, price: 4500000, hr: 18, avg: 0.265, rbi: 58, runs: 85, sb: 35 },
  { name: "Lane Thomas", position: "OF", team: "WSH", number: 28, price: 3000000, hr: 22, avg: 0.268, rbi: 68, runs: 75, sb: 15 },
  { name: "Joey Meneses", position: "1B", team: "WSH", number: 45, price: 2000000, hr: 12, avg: 0.275, rbi: 55, runs: 45, sb: 0 },
  { name: "Keibert Ruiz", position: "C", team: "WSH", number: 25, price: 2500000, hr: 11, avg: 0.262, rbi: 45, runs: 35, sb: 0 },
  { name: "MacKenzie Gore", position: "P", team: "WSH", number: 1, price: 3000000, wins: 9, losses: 10, era: 4.15, saves: 0, strikeouts: 155 },
  { name: "Josiah Gray", position: "P", team: "WSH", number: 40, price: 2000000, wins: 7, losses: 11, era: 4.55, saves: 0, strikeouts: 128 },
  
  // ============== MILWAUKEE BREWERS (MIL) ==============
  { name: "Christian Yelich", position: "OF", team: "MIL", number: 22, price: 4200000, hr: 19, avg: 0.276, rbi: 76, runs: 85, sb: 28 },
  { name: "William Contreras", position: "C", team: "MIL", number: 24, price: 3500000, hr: 17, avg: 0.289, rbi: 78, runs: 55, sb: 0 },
  { name: "Willy Adames", position: "SS", team: "MIL", number: 27, price: 5000000, hr: 24, avg: 0.235, rbi: 78, runs: 60, sb: 5 },
  { name: "Sal Frelick", position: "OF", team: "MIL", number: 10, price: 2000000, hr: 5, avg: 0.275, rbi: 35, runs: 50, sb: 8 },
  { name: "Brandon Woodruff", position: "P", team: "MIL", number: 53, price: 5500000, wins: 10, losses: 5, era: 2.85, saves: 0, strikeouts: 128 },
  { name: "Corbin Burnes", position: "P", team: "MIL", number: 39, price: 9000000, wins: 15, losses: 8, era: 2.94, saves: 0, strikeouts: 198 },
  { name: "Devin Williams", position: "P", team: "MIL", number: 38, price: 3500000, wins: 2, losses: 1, era: 1.85, saves: 36, strikeouts: 68 },
  
  // ============== ST. LOUIS CARDINALS (STL) ==============
  { name: "Paul Goldschmidt", position: "1B", team: "STL", number: 46, price: 4500000, hr: 25, avg: 0.268, rbi: 80, runs: 75, sb: 5 },
  { name: "Nolan Arenado", position: "3B", team: "STL", number: 28, price: 4800000, hr: 26, avg: 0.266, rbi: 93, runs: 65, sb: 2 },
  { name: "Willson Contreras", position: "C", team: "STL", number: 40, price: 4000000, hr: 19, avg: 0.264, rbi: 58, runs: 45, sb: 0 },
  { name: "Lars Nootbaar", position: "OF", team: "STL", number: 21, price: 2500000, hr: 12, avg: 0.268, rbi: 45, runs: 55, sb: 5 },
  { name: "Masyn Winn", position: "SS", team: "STL", number: 0, price: 2000000, hr: 8, avg: 0.265, rbi: 38, runs: 50, sb: 10 },
  { name: "Miles Mikolas", position: "P", team: "STL", number: 39, price: 3500000, wins: 10, losses: 11, era: 4.28, saves: 0, strikeouts: 128 },
  { name: "Sonny Gray", position: "P", team: "STL", number: 54, price: 4500000, wins: 12, losses: 8, era: 3.45, saves: 0, strikeouts: 165 },
  { name: "Ryan Helsley", position: "P", team: "STL", number: 56, price: 2500000, wins: 2, losses: 2, era: 2.45, saves: 28, strikeouts: 62 },
  
  // ============== CHICAGO CUBS (CHC) ==============
  { name: "Cody Bellinger", position: "OF", team: "CHC", number: 24, price: 4800000, hr: 26, avg: 0.266, rbi: 97, runs: 85, sb: 10 },
  { name: "Dansby Swanson", position: "SS", team: "CHC", number: 7, price: 4500000, hr: 22, avg: 0.244, rbi: 81, runs: 75, sb: 8 },
  { name: "Nico Hoerner", position: "2B", team: "CHC", number: 2, price: 3500000, hr: 9, avg: 0.283, rbi: 52, runs: 70, sb: 20 },
  { name: "Ian Happ", position: "OF", team: "CHC", number: 8, price: 3500000, hr: 21, avg: 0.262, rbi: 65, runs: 65, sb: 5 },
  { name: "Michael Busch", position: "1B", team: "CHC", number: 29, price: 2000000, hr: 15, avg: 0.258, rbi: 48, runs: 40, sb: 0 },
  { name: "Justin Steele", position: "P", team: "CHC", number: 35, price: 4500000, wins: 16, losses: 5, era: 3.05, saves: 0, strikeouts: 168 },
  { name: "Marcus Stroman", position: "P", team: "CHC", number: 0, price: 4000000, wins: 10, losses: 8, era: 3.85, saves: 0, strikeouts: 118 },
  { name: "Adbert Alzolay", position: "P", team: "CHC", number: 73, price: 2000000, wins: 1, losses: 2, era: 2.95, saves: 22, strikeouts: 52 },
  
  // ============== CINCINNATI REDS (CIN) ==============
  { name: "Elly De La Cruz", position: "SS", team: "CIN", number: 44, price: 5500000, hr: 13, avg: 0.235, rbi: 44, runs: 65, sb: 35 },
  { name: "Matt McLain", position: "2B", team: "CIN", number: 9, price: 3500000, hr: 16, avg: 0.285, rbi: 55, runs: 70, sb: 12 },
  { name: "Spencer Steer", position: "OF", team: "CIN", number: 7, price: 3000000, hr: 22, avg: 0.275, rbi: 75, runs: 70, sb: 5 },
  { name: "TJ Friedl", position: "OF", team: "CIN", number: 29, price: 2000000, hr: 12, avg: 0.279, rbi: 44, runs: 55, sb: 12 },
  { name: "Tyler Stephenson", position: "C", team: "CIN", number: 37, price: 2500000, hr: 14, avg: 0.268, rbi: 50, runs: 40, sb: 0 },
  { name: "Hunter Greene", position: "P", team: "CIN", number: 21, price: 4500000, wins: 10, losses: 9, era: 3.85, saves: 0, strikeouts: 188 },
  { name: "Andrew Abbott", position: "P", team: "CIN", number: 37, price: 2500000, wins: 9, losses: 7, era: 3.55, saves: 0, strikeouts: 145 },
  { name: "Alexis Diaz", position: "P", team: "CIN", number: 66, price: 2500000, wins: 2, losses: 1, era: 2.35, saves: 35, strikeouts: 62 },
  
  // ============== PITTSBURGH PIRATES (PIT) ==============
  { name: "Bryan Reynolds", position: "OF", team: "PIT", number: 10, price: 4500000, hr: 24, avg: 0.267, rbi: 74, runs: 70, sb: 5 },
  { name: "Oneil Cruz", position: "SS", team: "PIT", number: 15, price: 3500000, hr: 15, avg: 0.250, rbi: 50, runs: 55, sb: 10 },
  { name: "Ke'Bryan Hayes", position: "3B", team: "PIT", number: 13, price: 2500000, hr: 15, avg: 0.252, rbi: 58, runs: 50, sb: 5 },
  { name: "Andrew McCutchen", position: "DH", team: "PIT", number: 22, price: 2000000, hr: 12, avg: 0.265, rbi: 45, runs: 50, sb: 5 },
  { name: "Mitch Keller", position: "P", team: "PIT", number: 23, price: 3500000, wins: 12, losses: 9, era: 3.95, saves: 0, strikeouts: 168 },
  { name: "Johan Oviedo", position: "P", team: "PIT", number: 61, price: 2000000, wins: 8, losses: 11, era: 4.25, saves: 0, strikeouts: 145 },
  { name: "David Bednar", position: "P", team: "PIT", number: 57, price: 2500000, wins: 1, losses: 2, era: 2.45, saves: 30, strikeouts: 58 },
  
  // ============== LOS ANGELES DODGERS (LAD) ==============
  { name: "Shohei Ohtani", position: "DH", team: "LAD", number: 17, price: 30000000, isStar: true, hr: 44, avg: 0.304, rbi: 95, runs: 102, sb: 18 },
  { name: "Mookie Betts", position: "OF", team: "LAD", number: 50, price: 25000000, isStar: true, hr: 39, avg: 0.307, rbi: 107, runs: 120, sb: 8 },
  { name: "Freddie Freeman", position: "1B", team: "LAD", number: 5, price: 20000000, isStar: true, hr: 29, avg: 0.282, rbi: 102, runs: 105, sb: 5 },
  { name: "Will Smith", position: "C", team: "LAD", number: 16, price: 6500000, hr: 19, avg: 0.288, rbi: 70, runs: 60, sb: 0 },
  { name: "Max Muncy", position: "3B", team: "LAD", number: 13, price: 5000000, hr: 32, avg: 0.225, rbi: 80, runs: 70, sb: 2 },
  { name: "James Outman", position: "OF", team: "LAD", number: 33, price: 3500000, hr: 13, avg: 0.238, rbi: 43, runs: 55, sb: 5 },
  { name: "Clayton Kershaw", position: "P", team: "LAD", number: 22, price: 5500000, wins: 12, losses: 6, era: 3.35, saves: 0, strikeouts: 138 },
  { name: "Walker Buehler", position: "P", team: "LAD", number: 21, price: 4000000, wins: 8, losses: 5, era: 3.45, saves: 0, strikeouts: 98 },
  { name: "Evan Phillips", position: "P", team: "LAD", number: 59, price: 3000000, wins: 2, losses: 2, era: 2.15, saves: 25, strikeouts: 58 },
  
  // ============== SAN DIEGO PADRES (SD) ==============
  { name: "Fernando Tatis Jr.", position: "OF", team: "SD", number: 23, price: 14000000, hr: 33, avg: 0.257, rbi: 88, runs: 95, sb: 25 },
  { name: "Manny Machado", position: "3B", team: "SD", number: 13, price: 13000000, hr: 30, avg: 0.258, rbi: 91, runs: 70, sb: 4 },
  { name: "Juan Soto", position: "OF", team: "SD", number: 22, price: 12000000, hr: 35, avg: 0.275, rbi: 100, runs: 110, sb: 5 },
  { name: "Xander Bogaerts", position: "SS", team: "SD", number: 2, price: 8000000, hr: 19, avg: 0.268, rbi: 65, runs: 70, sb: 8 },
  { name: "Ha-Seong Kim", position: "2B", team: "SD", number: 7, price: 4000000, hr: 17, avg: 0.262, rbi: 55, runs: 75, sb: 35 },
  { name: "Blake Snell", position: "P", team: "SD", number: 4, price: 8500000, wins: 14, losses: 9, era: 2.25, saves: 0, strikeouts: 225 },
  { name: "Joe Musgrove", position: "P", team: "SD", number: 44, price: 5000000, wins: 10, losses: 7, era: 3.55, saves: 0, strikeouts: 138 },
  { name: "Josh Hader", position: "P", team: "SD", number: 71, price: 4000000, wins: 2, losses: 1, era: 2.55, saves: 32, strikeouts: 65 },
  
  // ============== SAN FRANCISCO GIANTS (SF) ==============
  { name: "Mike Yastrzemski", position: "OF", team: "SF", number: 5, price: 3000000, hr: 15, avg: 0.248, rbi: 48, runs: 50, sb: 3 },
  { name: "Thairo Estrada", position: "2B", team: "SF", number: 39, price: 2500000, hr: 14, avg: 0.275, rbi: 52, runs: 65, sb: 15 },
  { name: "LaMonte Wade Jr.", position: "1B", team: "SF", number: 31, price: 2000000, hr: 10, avg: 0.272, rbi: 42, runs: 50, sb: 2 },
  { name: "Patrick Bailey", position: "C", team: "SF", number: 14, price: 2000000, hr: 8, avg: 0.255, rbi: 35, runs: 30, sb: 0 },
  { name: "Logan Webb", position: "P", team: "SF", number: 62, price: 5500000, wins: 14, losses: 9, era: 3.25, saves: 0, strikeouts: 175 },
  { name: "Alex Cobb", position: "P", team: "SF", number: 38, price: 3500000, wins: 10, losses: 8, era: 3.85, saves: 0, strikeouts: 128 },
  { name: "Camilo Doval", position: "P", team: "SF", number: 75, price: 3000000, wins: 2, losses: 2, era: 2.55, saves: 30, strikeouts: 62 },
  
  // ============== ARIZONA DIAMONDBACKS (ARI) ==============
  { name: "Corbin Carroll", position: "OF", team: "ARI", number: 7, price: 10000000, hr: 25, avg: 0.295, rbi: 75, runs: 110, sb: 45 },
  { name: "Ketel Marte", position: "2B", team: "ARI", number: 4, price: 6500000, hr: 25, avg: 0.285, rbi: 82, runs: 85, sb: 5 },
  { name: "Christian Walker", position: "1B", team: "ARI", number: 53, price: 4000000, hr: 33, avg: 0.262, rbi: 85, runs: 70, sb: 2 },
  { name: "Lourdes Gurriel Jr.", position: "OF", team: "ARI", number: 12, price: 4500000, hr: 24, avg: 0.275, rbi: 72, runs: 60, sb: 2 },
  { name: "Gabriel Moreno", position: "C", team: "ARI", number: 14, price: 3000000, hr: 7, avg: 0.285, rbi: 45, runs: 40, sb: 2 },
  { name: "Zac Gallen", position: "P", team: "ARI", number: 23, price: 7500000, wins: 15, losses: 7, era: 3.35, saves: 0, strikeouts: 185 },
  { name: "Merrill Kelly", position: "P", team: "ARI", number: 41, price: 4000000, wins: 12, losses: 8, era: 3.75, saves: 0, strikeouts: 145 },
  { name: "Paul Sewald", position: "P", team: "ARI", number: 36, price: 2500000, wins: 2, losses: 1, era: 2.85, saves: 28, strikeouts: 55 },
  
  // ============== COLORADO ROCKIES (COL) ==============
  { name: "Kris Bryant", position: "OF", team: "COL", number: 23, price: 4000000, hr: 12, avg: 0.278, rbi: 45, runs: 40, sb: 3 },
  { name: "Ryan McMahon", position: "3B", team: "COL", number: 24, price: 3000000, hr: 20, avg: 0.245, rbi: 65, runs: 55, sb: 5 },
  { name: "Ezequiel Tovar", position: "SS", team: "COL", number: 14, price: 2500000, hr: 15, avg: 0.268, rbi: 55, runs: 60, sb: 8 },
  { name: "Elias Diaz", position: "C", team: "COL", number: 35, price: 2000000, hr: 10, avg: 0.275, rbi: 42, runs: 30, sb: 0 },
  { name: "Kyle Freeland", position: "P", team: "COL", number: 21, price: 2500000, wins: 8, losses: 12, era: 4.85, saves: 0, strikeouts: 118 },
  { name: "German Marquez", position: "P", team: "COL", number: 48, price: 3000000, wins: 7, losses: 10, era: 5.15, saves: 0, strikeouts: 105 },
];

// Funciones auxiliares
export const getPlayersByPosition = (position: string) => {
  return MLB_PLAYERS.filter(p => p.position.includes(position));
};

export const getPlayersByTeam = (team: string) => {
  return MLB_PLAYERS.filter(p => p.team === team);
};

export const getPlayersByPriceRange = (min: number, max: number) => {
  return MLB_PLAYERS.filter(p => p.price >= min && p.price <= max);
};

export const getStarPlayers = () => {
  return MLB_PLAYERS.filter(p => p.isStar);
};

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

// Información de equipos
export const TEAM_INFO: Record<string, { name: string; city: string; division: string; stadium: string }> = {
  'NYY': { name: 'New York Yankees', city: 'New York', division: 'AL East', stadium: 'Yankee Stadium' },
  'BOS': { name: 'Boston Red Sox', city: 'Boston', division: 'AL East', stadium: 'Fenway Park' },
  'TB': { name: 'Tampa Bay Rays', city: 'Tampa Bay', division: 'AL East', stadium: 'Tropicana Field' },
  'TOR': { name: 'Toronto Blue Jays', city: 'Toronto', division: 'AL East', stadium: 'Rogers Centre' },
  'BAL': { name: 'Baltimore Orioles', city: 'Baltimore', division: 'AL East', stadium: 'Oriole Park' },
  'CWS': { name: 'Chicago White Sox', city: 'Chicago', division: 'AL Central', stadium: 'Guaranteed Rate Field' },
  'CLE': { name: 'Cleveland Guardians', city: 'Cleveland', division: 'AL Central', stadium: 'Progressive Field' },
  'DET': { name: 'Detroit Tigers', city: 'Detroit', division: 'AL Central', stadium: 'Comerica Park' },
  'KC': { name: 'Kansas City Royals', city: 'Kansas City', division: 'AL Central', stadium: 'Kauffman Stadium' },
  'MIN': { name: 'Minnesota Twins', city: 'Minneapolis', division: 'AL Central', stadium: 'Target Field' },
  'HOU': { name: 'Houston Astros', city: 'Houston', division: 'AL West', stadium: 'Minute Maid Park' },
  'SEA': { name: 'Seattle Mariners', city: 'Seattle', division: 'AL West', stadium: 'T-Mobile Park' },
  'TEX': { name: 'Texas Rangers', city: 'Arlington', division: 'AL West', stadium: 'Globe Life Field' },
  'LAA': { name: 'Los Angeles Angels', city: 'Anaheim', division: 'AL West', stadium: 'Angel Stadium' },
  'OAK': { name: 'Oakland Athletics', city: 'Oakland', division: 'AL West', stadium: 'Oakland Coliseum' },
  'ATL': { name: 'Atlanta Braves', city: 'Atlanta', division: 'NL East', stadium: 'Truist Park' },
  'PHI': { name: 'Philadelphia Phillies', city: 'Philadelphia', division: 'NL East', stadium: 'Citizens Bank Park' },
  'NYM': { name: 'New York Mets', city: 'New York', division: 'NL East', stadium: 'Citi Field' },
  'MIA': { name: 'Miami Marlins', city: 'Miami', division: 'NL East', stadium: 'LoanDepot Park' },
  'WSH': { name: 'Washington Nationals', city: 'Washington', division: 'NL East', stadium: 'Nationals Park' },
  'MIL': { name: 'Milwaukee Brewers', city: 'Milwaukee', division: 'NL Central', stadium: 'American Family Field' },
  'STL': { name: 'St. Louis Cardinals', city: 'St. Louis', division: 'NL Central', stadium: 'Busch Stadium' },
  'CHC': { name: 'Chicago Cubs', city: 'Chicago', division: 'NL Central', stadium: 'Wrigley Field' },
  'CIN': { name: 'Cincinnati Reds', city: 'Cincinnati', division: 'NL Central', stadium: 'Great American Ball Park' },
  'PIT': { name: 'Pittsburgh Pirates', city: 'Pittsburgh', division: 'NL Central', stadium: 'PNC Park' },
  'LAD': { name: 'Los Angeles Dodgers', city: 'Los Angeles', division: 'NL West', stadium: 'Dodger Stadium' },
  'SD': { name: 'San Diego Padres', city: 'San Diego', division: 'NL West', stadium: 'Petco Park' },
  'SF': { name: 'San Francisco Giants', city: 'San Francisco', division: 'NL West', stadium: 'Oracle Park' },
  'ARI': { name: 'Arizona Diamondbacks', city: 'Phoenix', division: 'NL West', stadium: 'Chase Field' },
  'COL': { name: 'Colorado Rockies', city: 'Denver', division: 'NL West', stadium: 'Coors Field' },
};
