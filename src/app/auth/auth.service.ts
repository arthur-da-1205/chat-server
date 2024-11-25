import { GenericException } from '@commons/exceptions/generic.exception';
import { PrismaService } from '@libraries/prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthLoginInput, AuthRegisterInput } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: AuthRegisterInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });
    if (existingUser) {
      throw new GenericException('Phone number already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.prisma.user.create({
      data: {
        phoneNumber: dto.phoneNumber,
        password: hashedPassword,
      },
    });

    const payload = { sub: newUser.id, email: newUser.phoneNumber };
    const token = this.jwtService.sign(payload);

    return { user: newUser, accessToken: token };
  }

  async login(dto: AuthLoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      username: user.username,
      phoneNumber: user.phoneNumber,
    };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: user,
    };
  }
}
