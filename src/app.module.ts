import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database.config';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Donor } from './donors/entities/donor.entity';
import { Buyer } from './buyers/entities/buyer.entity';
import { Request } from './requests/entities/request.entity';
import { DonorsModule } from './donors/donors.module';
import { BuyersModule } from './buyers/buyers.module';
import { RequestsModule } from './requests/requests.module';
import { EmailModule } from './email/email.module';
import { BabyModule } from './baby/baby.module';
import { ZipCodeModule } from './zip-codes/zip-code.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    NotificationsModule,
    BabyModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getDatabaseConfig(configService),
    }),
    TypeOrmModule.forFeature([User, Donor, Buyer, Request]),
    AuthModule,
    DonorsModule,
    BuyersModule,
    RequestsModule,
    EmailModule,
    ZipCodeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
