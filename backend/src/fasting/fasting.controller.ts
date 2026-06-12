import {
  Controller, Get, Post, Delete, Body, Param,
  ParseIntPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';
import { FastingService } from './fasting.service';
import { CreateFastingDto } from './dto/create-fasting.dto';

@ApiTags('Fasting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/fasting')
export class FastingController {
  constructor(private readonly fastingService: FastingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a completed fasting session' })
  @ApiResponse({ status: 201, description: 'Session saved' })
  async create(@CurrentUser() user: User, @Body() dto: CreateFastingDto) {
    return this.fastingService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all fasting sessions for current user' })
  async findAll(@CurrentUser() user: User) {
    return this.fastingService.findByUser(user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear all fasting sessions for current user' })
  async clearAll(@CurrentUser() user: User) {
    await this.fastingService.clearByUser(user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a single fasting session' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    await this.fastingService.remove(id, user.id);
  }
}
