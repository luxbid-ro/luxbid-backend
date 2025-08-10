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
          select: {
            content: true,
            createdAt: true,
            senderId: true
          }
        }
      }
    });

    // Formatez datele pentru frontend
    const conversations = acceptedOffers.map(offer => {
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
        lastMessage: offer.messages[0] || null,
        unreadCount: 0 // TODO: Implementez logica pentru mesaje necitite
      };
    });

    return conversations;
  }
}
