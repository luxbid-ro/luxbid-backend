import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwt: JwtService, private prisma: PrismaService) {}

  async handleConnection(client: Socket) {
    try {
      const token = (client.handshake.auth as any)?.token || (client.handshake.headers?.authorization || '').replace('Bearer ', '');
      if (!token) return client.disconnect(true);
      const payload = this.jwt.decode(token) as any;
      (client.data as any).userId = payload?.sub || payload?.id;
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {}

  @SubscribeMessage('joinConversation')
  handleJoin(client: Socket, payload: { conversationId: string }) {
    client.join(payload.conversationId);
  }

  @SubscribeMessage('leaveConversation')
  handleLeave(client: Socket, payload: { conversationId: string }) {
    client.leave(payload.conversationId);
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, payload: { conversationId: string; isTyping: boolean }) {
    client.to(payload.conversationId).emit('userTyping', { userId: (client.data as any).userId, isTyping: payload.isTyping });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() body: { conversationId: string; content: string }) {
    const senderId = (client.data as any).userId as string;
    const message = {
      id: Math.random().toString(36).slice(2),
      content: body.content,
      senderId,
      senderName: 'User',
      createdAt: new Date().toISOString(),
    };
    // Broadcast to room
    this.server.to(body.conversationId).emit('newMessage', message);
  }
}


