import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// GET - Obtener pagos
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const adminView = searchParams.get('adminView') === 'true'

    // Vista de admin - ver todos los pagos pendientes
    if (adminView && session.user.role === 'admin') {
      const payments = await db.payment.findMany({
        where: status ? { status } : { status: 'pending' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              paymentStatus: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(payments)
    }

    // Vista de usuario - ver sus propios pagos
    const payments = await db.payment.findMany({
      where: { 
        userId: userId || session.user.id 
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Error al obtener pagos' }, { status: 500 })
  }
}

// POST - Crear nuevo pago
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, reference, phoneNumber, month } = body

    // Obtener la liga activa
    const league = await db.league.findFirst({
      where: { isActive: true }
    })

    if (!league) {
      return NextResponse.json({ error: 'No hay liga activa' }, { status: 404 })
    }

    // Verificar que no exista un pago para el mismo mes
    const existingPayment = await db.payment.findFirst({
      where: {
        userId: session.user.id,
        month: month || new Date().toISOString().slice(0, 7),
        status: { in: ['pending', 'verified'] }
      }
    })

    if (existingPayment) {
      return NextResponse.json({ error: 'Ya existe un pago registrado para este mes' }, { status: 400 })
    }

    // Crear el pago
    const payment = await db.payment.create({
      data: {
        userId: session.user.id,
        amount: amount || league.monthlyFee || 500,
        method: 'transfermovil',
        reference,
        phoneNumber,
        month: month || new Date().toISOString().slice(0, 7),
        status: 'pending'
      }
    })

    // Crear notificación para el admin
    const admin = await db.user.findFirst({
      where: { role: 'admin' }
    })

    if (admin) {
      await db.notification.create({
        data: {
          userId: admin.id,
          type: 'payment_pending',
          title: 'Nuevo pago pendiente',
          message: `${session.user.name} ha registrado un pago de ${amount || league.monthlyFee} pesos`,
          data: JSON.stringify({ paymentId: payment.id })
        }
      })
    }

    return NextResponse.json(payment)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Error al crear pago' }, { status: 500 })
  }
}

// PATCH - Verificar/rechazar pago (solo admin)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId, action } = body

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    if (action === 'verify') {
      // Actualizar pago
      await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'verified',
          verifiedBy: session.user.id,
          verifiedAt: new Date()
        }
      })

      // Actualizar usuario
      await db.user.update({
        where: { id: payment.userId },
        data: {
          paymentStatus: 'paid',
          lastPaymentDate: new Date(),
          paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isPaid: true,
          status: 'active'
        }
      })

      // Notificar al usuario
      await db.notification.create({
        data: {
          userId: payment.userId,
          type: 'payment_verified',
          title: 'Pago verificado',
          message: 'Tu pago ha sido verificado correctamente. ¡Gracias!'
        }
      })

    } else if (action === 'reject') {
      await db.payment.update({
        where: { id: paymentId },
        data: {
          status: 'rejected',
          verifiedBy: session.user.id,
          verifiedAt: new Date()
        }
      })

      // Notificar al usuario
      await db.notification.create({
        data: {
          userId: payment.userId,
          type: 'payment_rejected',
          title: 'Pago rechazado',
          message: 'Tu pago ha sido rechazado. Por favor, verifica los datos e intenta de nuevo.'
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Error al actualizar pago' }, { status: 500 })
  }
}

// DELETE - Expulsar usuarios sin pago (solo admin)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Encontrar usuarios con pagos vencidos o sin pagar por más de 30 días
    const expiredUsers = await db.user.findMany({
      where: {
        role: 'user',
        paymentStatus: 'unpaid',
        OR: [
          { paymentDueDate: { lt: new Date() } },
          { 
            AND: [
              { lastPaymentDate: null },
              { createdAt: { lt: thirtyDaysAgo } }
            ]
          }
        ]
      },
      include: {
        signings: { include: { player: true } }
      }
    })

    // Expulsar usuarios
    for (const user of expiredUsers) {
      // Liberar jugadores al mercado
      for (const signing of user.signings) {
        await db.player.update({
          where: { id: signing.playerId },
          data: { isFree: true }
        })
      }

      // Eliminar fichajes del usuario
      await db.signing.deleteMany({
        where: { userId: user.id }
      })

      // Eliminar lineups
      await db.lineupEntry.deleteMany({
        where: { userId: user.id }
      })

      // Actualizar usuario como expulsado
      await db.user.update({
        where: { id: user.id },
        data: {
          status: 'expelled',
          paymentStatus: 'expired',
          balance: 0,
          totalPoints: 0
        }
      })

      // Notificar
      await db.notification.create({
        data: {
          userId: user.id,
          type: 'payment_expired',
          title: 'Cuenta expulsada',
          message: 'Tu cuenta ha sido expulsada por falta de pago. Contacta al administrador para reactivarla.'
        }
      })
    }

    return NextResponse.json({ 
      message: `${expiredUsers.length} usuarios expulsados`,
      count: expiredUsers.length
    })
  } catch (error) {
    console.error('Error expelling users:', error)
    return NextResponse.json({ error: 'Error al expulsar usuarios' }, { status: 500 })
  }
}
