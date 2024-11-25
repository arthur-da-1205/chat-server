import { Me } from '@commons/decorators/user.decorator';
import { PrismaService } from '@libraries/prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserUpdateDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(id: string) {
    return this.prisma.user.findMany({
      where: {
        id: { not: id }, // Exclude the logged-in user
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
      },
    });
  }

  async updateProfile(userId: string, updateUserDto: UserUpdateDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });

    return {
      id: updatedUser.id,
      username: updatedUser.username,
      profilePicture: updatedUser.profilePicture,
    };
  }
}
