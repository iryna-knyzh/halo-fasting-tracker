import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FastingSession } from '../entities/fasting-session.entity';
import { CreateFastingDto } from './dto/create-fasting.dto';

@Injectable()
export class FastingService {
  constructor(
    @InjectRepository(FastingSession)
    private readonly repo: Repository<FastingSession>,
  ) {}

  async create(userId: number, dto: CreateFastingDto): Promise<FastingSession> {
    const session = this.repo.create({ ...dto, userId });
    return this.repo.save(session);
  }

  async findByUser(userId: number): Promise<FastingSession[]> {
    return this.repo.find({
      where: { userId },
      order: { start: 'DESC' },
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    const session = await this.repo.findOne({ where: { id } });
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    if (session.userId !== userId) throw new ForbiddenException();
    await this.repo.remove(session);
  }

  async clearByUser(userId: number): Promise<void> {
    await this.repo.delete({ userId });
  }
}
