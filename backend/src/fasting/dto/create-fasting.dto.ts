import { IsNumber, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFastingDto {
  @ApiProperty({ example: 1718000000000 })
  @IsNumber()
  @IsPositive()
  start: number;

  @ApiProperty({ example: 1718057600000 })
  @IsNumber()
  @IsPositive()
  end: number;

  @ApiProperty({ example: 57600000 })
  @IsNumber()
  @IsPositive()
  duration: number;
}
