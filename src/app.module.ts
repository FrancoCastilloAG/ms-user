import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...databaseConfig
    }),
    MulterModule.register(),
    AuthModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}