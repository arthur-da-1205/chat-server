import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterInput } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async userRegister(@Body() body: AuthRegisterInput) {
    const { phoneNumber, password, username } = body;
    return this.authService.register({ phoneNumber, password, username });
  }
}
