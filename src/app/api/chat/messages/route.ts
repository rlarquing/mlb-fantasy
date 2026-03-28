import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener mensajes recientes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const roomId = searchParams.get('roomId') || 'general';
    
    const messages = await db.message.findMany({
      where: { roomId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
  }
}

// POST - Crear un mensaje
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { content, senderId, receiverId, roomId } = body;
    
    const message = await db.message.create({
      data: {
        content,
        senderId,
        receiverId,
        roomId: roomId || 'general'
      },
      include: {
        sender: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Error creating message' }, { status: 500 });
  }
}
