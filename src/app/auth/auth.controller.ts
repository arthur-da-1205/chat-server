import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginInput, AuthRegisterInput } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async userRegister(@Body() body: AuthRegisterInput) {
    const { phoneNumber, password } = body;
    return this.authService.register({ phoneNumber, password });
  }

  @Post('login')
  async userLogin(@Body() body: AuthLoginInput) {
    const { phoneNumber, password } = body;
    return this.authService.login({ phoneNumber, password });
  }
}
