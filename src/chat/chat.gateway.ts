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
    
    try {
      // conversationId is actually offerId
      const offer = await this.prisma.offer.findUnique({
        where: { id: body.conversationId },
        include: {
          user: true,
          listing: { include: { user: true } }
        }
      });

      if (!offer) {
        return;
      }

      const buyer = offer.user;
      const seller = offer.listing.user;
      const receiverId = senderId === buyer.id ? seller.id : buyer.id;

      // Save message to database
      const savedMessage = await this.prisma.message.create({
        data: {
          content: body.content,
          senderId,
          receiverId,
          offerId: body.conversationId
        },
        include: {
          sender: true
        }
      });

      const messageData = {
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: savedMessage.senderId,
        senderName: savedMessage.sender.firstName ? 
          `${savedMessage.sender.firstName} ${savedMessage.sender.lastName}` : 
          savedMessage.sender.companyName || savedMessage.sender.email,
        createdAt: savedMessage.createdAt.toISOString(),
      };

      // Broadcast to room
      this.server.to(body.conversationId).emit('newMessage', messageData);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }
}


