import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    // Găsesc toate ofertele acceptate unde utilizatorul este implicat
    const acceptedOffers = await this.prisma.offer.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { userId: userId }, // Ofertas făcute de user
          { listing: { userId: userId } } // Ofertas pe listările user-ului
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            personType: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            images: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
                email: true,
                personType: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                companyName: true,
                personType: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc' // Conversațiile cu activitate recentă primul
      }
    });

    // Formatez datele pentru frontend
    const conversations = await Promise.all(acceptedOffers.map(async offer => {
      // Determinez cine este "cealaltă persoană" în conversație
      const isUserOfferer = offer.userId === userId;
      const otherUser = isUserOfferer ? offer.listing.user : offer.user;
      
      // Formatez numele
      const otherUserName = otherUser.personType === 'FIZICA' 
        ? `${otherUser.firstName} ${otherUser.lastName}`
        : otherUser.companyName;

      return {
        offerId: offer.id,
        otherUser: {
          id: otherUser.id,
          name: otherUserName,
          email: otherUser.email
        },
        listing: {
          id: offer.listing.id,
          title: offer.listing.title,
          images: offer.listing.images
        },
        lastMessage: offer.messages[0] ? {
          content: offer.messages[0].content,
          createdAt: offer.messages[0].createdAt.toISOString(),
          senderId: offer.messages[0].senderId,
          senderName: offer.messages[0].sender.personType === 'FIZICA' 
            ? `${offer.messages[0].sender.firstName} ${offer.messages[0].sender.lastName}`
            : offer.messages[0].sender.companyName
        } : null,
        unreadCount: await this.getUnreadCount(offer.id, userId)
      };
    }));

    return conversations;
  }

  private async getUnreadCount(offerId: string, userId: string): Promise<number> {
    // Contez mesajele necitite (mesajele trimise de ceilalți către utilizatorul curent)
    return this.prisma.message.count({
      where: {
        offerId: offerId,
        senderId: { not: userId },
        // TODO: Adaugă câmp 'readAt' în schema pentru a urmări mesajele citite
        // readAt: null
      }
    });
  }

  async markMessagesAsRead(offerId: string, userId: string): Promise<void> {
    // TODO: Implementez când adaug câmpul 'readAt' în schema
    // await this.prisma.message.updateMany({
    //   where: {
    //     offerId: offerId,
    //     senderId: { not: userId },
    //     readAt: null
    //   },
    //   data: {
    //     readAt: new Date()
    //   }
    // });
  }
}
