import { IsString, IsEmail, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Іван Іванов' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'ivan@example.com' })
  @IsEmail({}, { message: 'Невірний формат email' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(4, { message: 'Пароль має містити мінімум 4 символи' })
  @MaxLength(100)
  password: string;
}
