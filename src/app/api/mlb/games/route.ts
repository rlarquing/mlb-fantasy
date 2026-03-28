import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MLB_TEAMS, generateTodayGames } from '@/lib/mlb-data';

// GET - Obtener partidos de hoy
export async function GET() {
  try {
    // Asegurar que los equipos existen
    let teams = await db.mLBTTeam.findMany();
    
    if (teams.length === 0) {
      await db.mLBTTeam.createMany({
        data: MLB_TEAMS.map(team => ({
          name: team.name,
          shortName: team.shortName,
          city: team.city,
          division: team.division,
          logo: team.logo,
          wins: team.wins,
          losses: team.losses,
        }))
      });
      teams = await db.mLBTTeam.findMany();
    }
    
    // Generar partidos de ejemplo
    const todayGames = generateTodayGames(MLB_TEAMS);
    
    // Verificar si ya existen partidos para hoy
    const existingGames = await db.game.findMany({
      where: {
        gameDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        }
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      }
    });
    
    if (existingGames.length > 0) {
      return NextResponse.json(existingGames);
    }
    
    // Crear partidos de hoy
    for (const game of todayGames) {
      const homeTeam = teams.find(t => t.shortName === game.homeTeam.shortName);
      const awayTeam = teams.find(t => t.shortName === game.awayTeam.shortName);
      
      if (homeTeam && awayTeam) {
        await db.game.create({
          data: {
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            gameDate: game.gameDate,
            stadium: game.stadium,
            status: game.status,
            homeScore: game.homeScore,
            awayScore: game.awayScore,
          }
        });
      }
    }
    
    const games = await db.game.findMany({
      where: {
        gameDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        }
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        gameDate: 'asc'
      }
    });
    
    return NextResponse.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Error fetching games' }, { status: 500 });
  }
}
