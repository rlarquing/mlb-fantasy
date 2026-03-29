import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const PORT = 3003;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:/home/z/my-project/db/custom.db'
    }
  }
});

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

console.log(`🚀 Chat service running on port ${PORT}`);

interface MessageData {
  content: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  roomId?: string;
  isPrivate?: boolean;
}

interface OnlineUser {
  id: string;
  name: string;
  socketId: string;
}

// Usuarios conectados
const onlineUsers = new Map<string, OnlineUser>();

io.on('connection', (socket) => {
  console.log(`👤 Usuario conectado: ${socket.id}`);

  // Usuario se une al chat
  socket.on('join', async (data: { userId: string; userName: string }) => {
    // Agregar a usuarios en línea
    onlineUsers.set(socket.id, {
      id: data.userId,
      name: data.userName,
      socketId: socket.id
    });

    // Unir a sala general
    socket.join('general');
    
    // Unir a sala personal para mensajes privados
    socket.join(`user_${data.userId}`);

    // Notificar a todos los usuarios
    io.emit('users-online', Array.from(onlineUsers.values()));
    
    // Enviar mensajes recientes del chat general
    try {
      const recentMessages = await prisma.message.findMany({
        where: { roomId: 'general' },
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { sender: { select: { id: true, name: true } } }
      });
      
      socket.emit('recent-messages', recentMessages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }

    // Notificar entrada
    socket.broadcast.to('general').emit('user-joined', {
      userId: data.userId,
      userName: data.userName
    });
    
    // Enviar notificaciones pendientes
    try {
      const pendingNotifications = await prisma.notification.findMany({
        where: { userId: data.userId, read: false },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      
      if (pendingNotifications.length > 0) {
        socket.emit('pending-notifications', pendingNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  });

  // Recibir mensaje (público o privado)
  socket.on('send-message', async (data: MessageData) => {
    try {
      // Guardar mensaje en base de datos
      const message = await prisma.message.create({
        data: {
          content: data.content,
          senderId: data.senderId,
          receiverId: data.receiverId || null,
          roomId: data.isPrivate ? null : (data.roomId || 'general')
        },
        include: {
          sender: { select: { id: true, name: true } }
        }
      });

      if (data.isPrivate && data.receiverId) {
        // Mensaje privado - enviar solo al receptor
        const receiverSocket = Array.from(onlineUsers.values())
          .find(u => u.id === data.receiverId);
        
        // Enviar al receptor
        io.to(`user_${data.receiverId}`).emit('new-private-message', {
          ...message,
          isPrivate: true
        });
        
        // También enviar al remitente para confirmación
        socket.emit('new-private-message', {
          ...message,
          isPrivate: true
        });
        
        // Crear notificación para el receptor
        await prisma.notification.create({
          data: {
            userId: data.receiverId,
            type: 'private_message',
            title: 'Nuevo mensaje privado',
            message: `${data.senderName} te envió un mensaje`,
            data: JSON.stringify({ senderId: data.senderId, messageId: message.id })
          }
        });
      } else {
        // Mensaje público
        io.to('general').emit('new-message', message);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Usuario escribiendo
  socket.on('typing', (data: { userId: string; userName: string; receiverId?: string }) => {
    if (data.receiverId) {
      // Typing en chat privado
      const receiverSocket = Array.from(onlineUsers.values())
        .find(u => u.id === data.receiverId);
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('user-typing-private', data);
      }
    } else {
      // Typing en chat general
      socket.broadcast.to('general').emit('user-typing', data);
    }
  });

  // Reportar usuario
  socket.on('report-user', async (data: {
    reporterId: string;
    reportedUserId: string;
    reason: string;
    description?: string;
  }) => {
    try {
      // Crear reporte
      const report = await prisma.report.create({
        data: {
          reporterId: data.reporterId,
          reportedUserId: data.reportedUserId,
          reason: data.reason,
          description: data.description
        }
      });
      
      // Notificar a los admins
      const admins = await prisma.user.findMany({
        where: { role: 'admin' }
      });
      
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'report_received',
            title: 'Nuevo reporte de usuario',
            message: `Un usuario ha reportado a otro por: ${data.reason}`,
            data: JSON.stringify({ reportId: report.id })
          }
        });
        
        // Si el admin está en línea, enviar notificación en tiempo real
        const adminSocket = Array.from(onlineUsers.values())
          .find(u => u.id === admin.id);
        if (adminSocket) {
          io.to(adminSocket.socketId).emit('admin-notification', {
            type: 'report',
            report: report
          });
        }
      }
      
      socket.emit('report-created', { success: true, reportId: report.id });
    } catch (error) {
      console.error('Error creating report:', error);
      socket.emit('report-created', { success: false, error: 'Error al crear reporte' });
    }
  });

  // Notificación de detección de trampa (desde el sistema)
  socket.on('cheat-detected', async (data: {
    userId: string;
    type: string;
    severity: string;
    description: string;
    evidence?: any;
  }) => {
    try {
      // Crear alerta de trampa
      const alert = await prisma.cheatAlert.create({
        data: {
          userId: data.userId,
          type: data.type,
          severity: data.severity,
          description: data.description,
          data: data.evidence ? JSON.stringify(data.evidence) : null
        }
      });
      
      // Notificar a todos los admins
      const admins = await prisma.user.findMany({
        where: { role: 'admin' }
      });
      
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'cheat_detected',
            title: `⚠️ Trampa detectada (${data.severity.toUpperCase()})`,
            message: data.description,
            data: JSON.stringify({ alertId: alert.id, userId: data.userId, type: data.type })
          }
        });
        
        const adminSocket = Array.from(onlineUsers.values())
          .find(u => u.id === admin.id);
        if (adminSocket) {
          io.to(adminSocket.socketId).emit('cheat-alert', alert);
        }
      }
      
      // Si el usuario está en línea, enviar advertencia (sin revelar detalles)
      const userSocket = Array.from(onlineUsers.values())
        .find(u => u.id === data.userId);
      if (userSocket) {
        io.to(userSocket.socketId).emit('warning', {
          message: 'Se ha detectado actividad sospechosa en tu cuenta.'
        });
      }
    } catch (error) {
      console.error('Error handling cheat detection:', error);
    }
  });

  // Marcar notificaciones como leídas
  socket.on('mark-notifications-read', async (data: { userId: string; notificationIds?: string[] }) => {
    try {
      if (data.notificationIds && data.notificationIds.length > 0) {
        await prisma.notification.updateMany({
          where: {
            id: { in: data.notificationIds },
            userId: data.userId
          },
          data: { read: true }
        });
      } else {
        await prisma.notification.updateMany({
          where: { userId: data.userId },
          data: { read: true }
        });
      }
    } catch (error) {
      console.error('Error marking notifications read:', error);
    }
  });

  // Desconexión
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      io.emit('users-online', Array.from(onlineUsers.values()));
      io.to('general').emit('user-left', {
        userId: user.id,
        userName: user.name
      });
      console.log(`👋 Usuario desconectado: ${user.name}`);
    }
  });
});
