import {
  Controller,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';

@ApiTags('Користувачі')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Отримати поточного користувача' })
  @ApiResponse({ status: 200, description: 'Профіль користувача', type: User })
  async getMe(@CurrentUser() user: User): Promise<User> {
    return this.userService.findOne(user.id);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Видалити власний акаунт' })
  @ApiResponse({ status: 204, description: 'Акаунт успішно видалено' })
  async deleteMe(@CurrentUser() user: User): Promise<void> {
    await this.userService.remove(user.id);
  }
}
