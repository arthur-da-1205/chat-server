import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsUrl()
  profilePicture?: string;
}
