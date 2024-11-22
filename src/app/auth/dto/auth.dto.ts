import { IsEmpty, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class AuthRegisterInput {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  @IsEmpty()
  username?: string

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}