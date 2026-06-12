import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(4)
  password: string;
}
