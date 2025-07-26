import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { EmailModule } from '../email/email.module';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { FirebaseService } from './firebase.service';
import { initializeFirebaseApp } from '../config/firebase.config';

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseService],
  exports: [NotificationsService, FirebaseService],
})
export class NotificationsModule {}
