import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET - Obtener información de temporada
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const seasons = await db.season.findMany({
      orderBy: { createdAt: 'desc' }
    })

    const currentSeason = await db.season.findFirst({
      where: { status: 'active' }
    })

    const league = await db.league.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        season: true,
        marketOpen: true,
        seasonStart: true,
        seasonEnd: true
      }
    })

    return NextResponse.json({
      seasons,
      currentSeason,
      league
    })
  } catch (error) {
    console.error('Error fetching season:', error)
    return NextResponse.json({ error: 'Error al obtener temporada' }, { status: 500 })
  }
}

// POST - Crear/iniciar nueva temporada
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { action, name, startDate, endDate } = body

    if (action === 'create') {
      // Finalizar temporadas anteriores
      await db.season.updateMany({
        where: { status: 'active' },
        data: { status: 'finished' }
      })

      // Crear nueva temporada
      const season = await db.season.create({
        data: {
          name: name || `Temporada ${new Date().getFullYear()}`,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : new Date(new Date().setMonth(new Date().getMonth() + 8)),
          status: 'active',
          currentWeek: 1,
          marketOpen: true
        }
      })

      // Resetear liga
      const league = await db.league.findFirst({ where: { isActive: true } })
      
      if (league) {
        await db.league.update({
          where: { id: league.id },
          data: {
            season: new Date().getFullYear().toString(),
            marketOpen: true
          }
        })
      }

      return NextResponse.json({ message: 'Nueva temporada creada', season })
    }

    if (action === 'advanceWeek') {
      const currentSeason = await db.season.findFirst({
        where: { status: 'active' }
      })

      if (currentSeason) {
        await db.season.update({
          where: { id: currentSeason.id },
          data: {
            currentWeek: { increment: 1 }
          }
        })
      }

      return NextResponse.json({ message: 'Semana avanzada' })
    }

    if (action === 'start') {
      await db.season.updateMany({
        where: { status: 'upcoming' },
        data: { status: 'active' }
      })
      return NextResponse.json({ message: 'Temporada iniciada' })
    }

    if (action === 'end') {
      await db.season.updateMany({
        where: { status: 'active' },
        data: { status: 'finished' }
      })

      // Cerrar mercado
      const league = await db.league.findFirst({ where: { isActive: true } })
      if (league) {
        await db.league.update({
          where: { id: league.id },
          data: { marketOpen: false }
        })
      }

      return NextResponse.json({ message: 'Temporada finalizada' })
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
  } catch (error) {
    console.error('Error in season action:', error)
    return NextResponse.json({ error: 'Error en acción de temporada' }, { status: 500 })
  }
}

// PATCH - Actualizar configuración de temporada
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { seasonId, name, startDate, endDate, currentWeek, marketOpen } = body

    const updateData: Record<string, any> = {}
    if (name !== undefined) updateData.name = name
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = new Date(endDate)
    if (currentWeek !== undefined) updateData.currentWeek = currentWeek
    if (marketOpen !== undefined) updateData.marketOpen = marketOpen

    const season = await db.season.update({
      where: { id: seasonId },
      data: updateData
    })

    return NextResponse.json(season)
  } catch (error) {
    console.error('Error updating season:', error)
    return NextResponse.json({ error: 'Error al actualizar temporada' }, { status: 500 })
  }
}
