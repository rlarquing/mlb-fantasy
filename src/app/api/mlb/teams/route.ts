import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MLB_TEAMS } from '@/lib/mlb-data';

// GET - Obtener todos los equipos MLB
export async function GET() {
  try {
    let teams = await db.mLBTeam.findMany();
    
    // Si no hay equipos, crearlos
    if (teams.length === 0) {
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
      });
      teams = await db.mLBTeam.findMany();
    }
    
    return NextResponse.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ error: 'Error fetching teams' }, { status: 500 });
  }
}
