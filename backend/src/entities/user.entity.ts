import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @ApiProperty({ description: 'Унікальний ідентифікатор користувача', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Ім\'я користувача', example: 'Іван Іванов' })
  @Column()
  name: string;

  @ApiProperty({ description: 'Email адреса користувача', example: 'ivan@example.com' })
  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Exclude()
  @Column({ select: false, nullable: true })
  refreshTokenHash: string | null;

  @ApiProperty({ description: 'Дата створення запису', example: '2024-01-18T12:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;
}
