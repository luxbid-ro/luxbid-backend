import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryDbService } from '../cloudinary-db.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryDb: CloudinaryDbService,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        personType: true,
        firstName: true,
        lastName: true,
        cnp: true,
        companyName: true,
        cui: true,
        regCom: true,
        phone: true,
        address: true,
        city: true,
        county: true,
        postalCode: true,
        country: true,
        isVerified: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Utilizatorul nu a fost găsit');
    }

    return user;
  }

  async updateProfile(userId: string, updateData: UpdateProfileDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('Utilizatorul nu a fost găsit');
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw new ConflictException('Acest email este deja folosit');
      }
    }

    // Validate person type specific fields
    if (updateData.personType) {
      if (updateData.personType === 'FIZICA') {
        // For physical persons, clear company fields
        updateData.companyName = null;
        updateData.cui = null;
        updateData.regCom = null;
      } else if (updateData.personType === 'JURIDICA') {
        // For legal entities, clear physical person fields
        updateData.firstName = null;
        updateData.lastName = null;
        updateData.cnp = null;
      }
    }

    try {
      // Update user in local database
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          personType: true,
          firstName: true,
          lastName: true,
          cnp: true,
          companyName: true,
          cui: true,
          regCom: true,
          phone: true,
          address: true,
          city: true,
          county: true,
          postalCode: true,
          country: true,
          isVerified: true,
          isAdmin: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 🔒 ALSO UPDATE IN CLOUDINARY for persistence
      try {
        const fullUserData = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (fullUserData) {
          await this.cloudinaryDb.saveUser({
            ...fullUserData,
            updatedAt: new Date().toISOString(),
          });
          console.log('✅ User profile updated in Cloudinary backup!');
        }
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to update Cloudinary backup:', cloudinaryError.message);
        // Don't fail the update if Cloudinary fails
      }

      return updatedUser;

    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Datele introduse sunt deja folosite');
      }
      
      console.error('Error updating user profile:', {
        userId,
        error: error?.message,
        code: error?.code,
      });
      
      throw error;
    }
  }

  async changePassword(userId: string, changePasswordData: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordData;

    // Validate that new passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Parolele noi nu se potrivesc');
    }

    // Get current user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilizatorul nu a fost găsit');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Parola curentă este incorectă');
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Parola nouă trebuie să fie diferită de cea curentă');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    try {
      // Update password in local database
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          updatedAt: true,
        },
      });

      // 🔒 ALSO UPDATE IN CLOUDINARY for persistence
      try {
        const fullUserData = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (fullUserData) {
          await this.cloudinaryDb.saveUser({
            ...fullUserData,
            updatedAt: new Date().toISOString(),
          });
          console.log('✅ Password updated in Cloudinary backup!');
        }
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to update password in Cloudinary:', cloudinaryError.message);
        // Don't fail the update if Cloudinary fails
      }

      return {
        message: 'Parola a fost schimbată cu succes',
        user: updatedUser,
      };

    } catch (error: any) {
      console.error('Error changing password:', {
        userId,
        error: error?.message,
        code: error?.code,
      });
      
      throw error;
    }
  }

  async deleteAccount(userId: string, password: string) {
    // Get user to verify password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Utilizatorul nu a fost găsit');
    }

    // Verify password before deletion
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Parola este incorectă');
    }

    try {
      // Delete from local database (cascade will handle related records)
      await this.prisma.user.delete({
        where: { id: userId },
      });

      // Delete from Cloudinary backup
      try {
        await this.cloudinaryDb.deleteUser(user.email);
        console.log('✅ User deleted from Cloudinary backup!');
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to delete from Cloudinary:', cloudinaryError.message);
      }

      return {
        message: 'Contul a fost șters cu succes',
      };

    } catch (error: any) {
      console.error('Error deleting account:', {
        userId,
        error: error?.message,
        code: error?.code,
      });
      
      throw error;
    }
  }
}
