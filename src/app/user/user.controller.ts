import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Me } from '@commons/decorators/user.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '@guards/jwt-auth.guard';
import { UserUpdateDto } from './dto/user.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  async getAllUsers(@Me() me: User) {
    const currentUserId = me.id; // Ambil ID user dari token JWT

    return this.userService.getAllUsers(currentUserId);
  }

  @Post('update')
  async updateUser(@Body() dto: UserUpdateDto, @Me() me: User) {
    const { id } = me;

    return this.userService.updateProfile(id, dto);
  }
}
