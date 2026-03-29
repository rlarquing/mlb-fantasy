// Sistema de Puntuación MLB Fantasy
// Puntos basados en rendimiento real de jugadores

export interface BattingStats {
  hits: number
  doubles: number
  triples: number
  homeRuns: number
  rbi: number
  runs: number
  stolenBases: number
  walks: number
  strikeouts: number
}

export interface PitchingStats {
  wins: number
  saves: number
  inningsPitched: number
  strikeouts: number
  earnedRuns: number
  losses: number
}

export interface ScoringConfig {
  // Bateadores
  hit: number
  double: number
  triple: number
  homeRun: number
  rbi: number
  run: number
  stolenBase: number
  walk: number
  strikeout: number

  // Pitchers
  win: number
  save: number
  inningPitched: number
  strikeoutPitcher: number
  earnedRun: number
  loss: number
}

// Configuración por defecto de puntuación
export const DEFAULT_SCORING: ScoringConfig = {
  // Bateadores
  hit: 1,
  double: 2,
  triple: 3,
  homeRun: 4,
  rbi: 1,
  run: 1,
  stolenBase: 2,
  walk: 1,
  strikeout: -1,

  // Pitchers
  win: 5,
  save: 5,
  inningPitched: 1,
  strikeoutPitcher: 1,
  earnedRun: -2,
  loss: -3,
}

// Reglas de puntuación para mostrar en la UI
export const SCORING_RULES = {
  batting: [
    { action: 'hit', points: 1, description: 'Hit (sencillo)' },
    { action: 'double', points: 2, description: 'Doble' },
    { action: 'triple', points: 3, description: 'Triple' },
    { action: 'home_run', points: 4, description: 'Home Run' },
    { action: 'rbi', points: 1, description: 'Carrera impulsada (RBI)' },
    { action: 'run', points: 1, description: 'Carrera anotada' },
    { action: 'stolen_base', points: 2, description: 'Base robada' },
    { action: 'walk', points: 1, description: 'Base por bolas' },
    { action: 'strikeout', points: -1, description: 'Ponche (bateador)' },
  ],
  pitching: [
    { action: 'win', points: 5, description: 'Victoria' },
    { action: 'save', points: 5, description: 'Salvamento' },
    { action: 'inning_pitched', points: 1, description: 'Entrada lanzada' },
    { action: 'strikeout_pitcher', points: 1, description: 'Ponche (pitcher)' },
    { action: 'earned_run', points: -2, description: 'Carrera limpia permitida' },
    { action: 'loss', points: -3, description: 'Derrota' },
  ]
}

// Calcular puntos de bateador
export function calculateBattingPoints(stats: BattingStats, config: ScoringConfig = DEFAULT_SCORING): number {
  let points = 0

  // Hits sencillos = hits totales - dobles - triples - HR
  const singles = stats.hits - stats.doubles - stats.triples - stats.homeRuns

  points += singles * config.hit
  points += stats.doubles * config.double
  points += stats.triples * config.triple
  points += stats.homeRuns * config.homeRun
  points += stats.rbi * config.rbi
  points += stats.runs * config.run
  points += stats.stolenBases * config.stolenBase
  points += stats.walks * config.walk
  points += stats.strikeouts * config.strikeout

  return points
}

// Calcular puntos de pitcher
export function calculatePitchingPoints(stats: PitchingStats, config: ScoringConfig = DEFAULT_SCORING): number {
  let points = 0

  points += stats.wins * config.win
  points += stats.saves * config.save
  points += Math.floor(stats.inningsPitched) * config.inningPitched
  points += stats.strikeouts * config.strikeoutPitcher
  points += stats.earnedRuns * config.earnedRun
  points += stats.losses * config.loss

  return points
}

// Calcular puntos totales de un jugador en un partido
export function calculateGamePoints(
  battingStats: Partial<BattingStats>,
  pitchingStats: Partial<PitchingStats>,
  isPitcher: boolean = false,
  config: ScoringConfig = DEFAULT_SCORING
): number {
  let totalPoints = 0

  // Puntos de bateo (todos los jugadores pueden batear)
  if (battingStats) {
    totalPoints += calculateBattingPoints({
      hits: battingStats.hits || 0,
      doubles: battingStats.doubles || 0,
      triples: battingStats.triples || 0,
      homeRuns: battingStats.homeRuns || 0,
      rbi: battingStats.rbi || 0,
      runs: battingStats.runs || 0,
      stolenBases: battingStats.stolenBases || 0,
      walks: battingStats.walks || 0,
      strikeouts: battingStats.strikeouts || 0,
    }, config)
  }

  // Puntos de pitcheo (solo pitchers)
  if (isPitcher && pitchingStats) {
    totalPoints += calculatePitchingPoints({
      wins: pitchingStats.wins || 0,
      saves: pitchingStats.saves || 0,
      inningsPitched: pitchingStats.inningsPitched || 0,
      strikeouts: pitchingStats.strikeouts || 0,
      earnedRuns: pitchingStats.earnedRuns || 0,
      losses: pitchingStats.losses || 0,
    }, config)
  }

  return totalPoints
}

// Aplicar bonificación de capitán (duplica puntos)
export function applyCaptainBonus(points: number, isCaptain: boolean): number {
  return isCaptain ? points * 2 : points
}

// Posiciones válidas para lineup
export const LINEUP_POSITIONS = [
  { code: 'P', name: 'Pitcher', required: 1 },
  { code: 'C', name: 'Catcher', required: 1 },
  { code: '1B', name: 'Primera Base', required: 1 },
  { code: '2B', name: 'Segunda Base', required: 1 },
  { code: '3B', name: 'Tercera Base', required: 1 },
  { code: 'SS', name: 'Shortstop', required: 1 },
  { code: 'OF', name: 'Outfielder', required: 3 },
  { code: 'DH', name: 'Bateador Designado', required: 1 },
] as const

// Tamaño total del lineup (11 jugadores)
export const LINEUP_SIZE = LINEUP_POSITIONS.reduce((sum, pos) => sum + pos.required, 0)

// Validar que un lineup está completo
export function validateLineup(entries: { position: string; isStarter: boolean }[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  const starters = entries.filter(e => e.isStarter)

  // Verificar cantidad total de titulares
  if (starters.length !== LINEUP_SIZE) {
    errors.push(`El lineup debe tener exactamente ${LINEUP_SIZE} titulares, tienes ${starters.length}`)
  }

  // Verificar cada posición
  for (const pos of LINEUP_POSITIONS) {
    const count = starters.filter(e => e.position === pos.code).length
    if (count !== pos.required) {
      errors.push(`${pos.name}: necesitas ${pos.required}, tienes ${count}`)
    }
  }

  // Verificar que haya exactamente un capitán
  const captains = entries.filter(e => e.isStarter && ('isCaptain' in e) && (e as { isCaptain?: boolean }).isCaptain)
  if (captains.length === 0) {
    errors.push('Debes seleccionar un capitán')
  } else if (captains.length > 1) {
    errors.push('Solo puedes tener un capitán')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Actualizar precio de jugador basado en rendimiento
export function calculateNewPrice(
  currentPrice: number,
  weeklyPoints: number,
  ownership: number,
  avgPoints: number
): number {
  // Factor de rendimiento (0.8 a 1.2)
  const performanceFactor = Math.max(0.8, Math.min(1.2, 1 + (weeklyPoints - avgPoints) / 50))

  // Factor de popularidad (0.9 a 1.1)
  const popularityFactor = Math.max(0.9, Math.min(1.1, 1 + (ownership - 50) / 500))

  // Nuevo precio
  const newPrice = Math.round(currentPrice * performanceFactor * popularityFactor)

  // Límites de cambio (máximo 10% por semana)
  const maxChange = currentPrice * 0.1
  const boundedPrice = Math.max(
    currentPrice - maxChange,
    Math.min(currentPrice + maxChange, newPrice)
  )

  // Precio mínimo de 500,000
  return Math.max(500000, Math.round(boundedPrice / 100000) * 100000)
}

// Obtener descripción de puntos
export function getPointsDescription(action: string): string {
  const allRules = [...SCORING_RULES.batting, ...SCORING_RULES.pitching]
  const rule = allRules.find(r => r.action === action)
  return rule?.description || action
}
