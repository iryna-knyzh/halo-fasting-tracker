import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FastingModule } from './fasting/fasting.module';
import { User } from './entities/user.entity';
import { FastingSession } from './entities/fasting-session.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'app_user',
      password: process.env.DB_PASSWORD || 'app_password',
      database: process.env.DB_NAME || 'app_db',
      entities: [User, FastingSession],
      // In production synchronize is off by default; set DB_SYNCHRONIZE=true to
      // let TypeORM create the schema on first deploy (no migrations yet).
      synchronize:
        process.env.DB_SYNCHRONIZE !== undefined
          ? process.env.DB_SYNCHRONIZE === 'true'
          : process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
    UserModule,
    AuthModule,
    FastingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
