import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

const bigintTransformer = {
  to: (v: number) => v,
  from: (v: string) => Number(v),
};

@Entity('fasting_sessions')
export class FastingSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  start: number;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  end: number;

  @Column({ type: 'bigint', transformer: bigintTransformer })
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}
