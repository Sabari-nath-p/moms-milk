import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { FirebaseService } from './firebase.service';
import { NotificationDto } from '../auth/dto/auth.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async sendNotification(notificationDto: NotificationDto) {
    let users: User[] = [];

    switch (notificationDto.type) {
      case 'all':
        users = await this.userRepository.find();
        break;
      case 'zipcode':
        users = await this.userRepository.find({
          where: { zipCode: notificationDto.zipCode },
        });
        break;

      case 'user':
        if (notificationDto.userId) {
          const user = await this.userRepository.findOne({
            where: { id: notificationDto.userId },
          });
          if (user) users = [user];
        }
        break;
    }

    // Collect FCM tokens for users who have them
    const fcmTokens = users
      .filter(user => user.fcmToken)
      .map(user => user.fcmToken);

    // Send notifications
    const results = await Promise.all([
      // Send emails
      ...users.map(user =>
        this.emailService.sendNotificationEmail(
          user.email,
          notificationDto.subject,
          notificationDto.message,
        )
      ),
      // Send push notifications if there are tokens
      ...(fcmTokens.length > 0
        ? [
            this.firebaseService.sendMulticastNotification(
              fcmTokens,
              notificationDto.subject,
              notificationDto.message,
              notificationDto.data
            ),
          ]
        : []),
    ]);

    return { 
      message: `Notification sent to ${users.length} users`,
      emailsSent: users.length,
      pushNotificationsSent: fcmTokens.length
    };
  }

  async updateUserFCMToken(userId: string, fcmToken: string) {
    await this.userRepository.update(userId, { fcmToken });
    return { success: true };
  }
  

  async notifyBuyerOfDonorAvailability(donorId: string) {
    const donor = await this.userRepository.findOne({
      where: { id: donorId, role: UserRole.DONOR },
    });

    if (!donor) {
      return;
    }

    const buyers = await this.userRepository.find({
      where: { role: UserRole.BUYER, zipCode: donor.zipCode },
    });

    const notification: NotificationDto = {
      type: 'user',
      subject: 'Donor Available in Your Area',
      message: `A milk donor is now available in your area (${donor.zipCode}).`,
      data: {
        donorZipCode: donor.zipCode,
        notificationType: 'NEW_DONOR'
      }
    };

    for (const buyer of buyers) {
      await this.sendNotification({
        ...notification,
        userId: buyer.id
      });
    }
  }

  async notifyOnRequestUpdate(requestId: string, status: string, recipientId: string) {
    const notification: NotificationDto = {
      type: 'user',
      userId: recipientId,
      subject: 'Request Update',
      message: `Your request (${requestId}) has been ${status}.`,
      data: {
        requestId,
        status,
        notificationType: 'REQUEST_UPDATE'
      }
    };

    await this.sendNotification(notification);
  }
}
