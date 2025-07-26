import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { NotificationDto } from '../auth/dto/auth.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
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
      case 'role':
        users = await this.userRepository.find({
          where: { role: notificationDto.role as UserRole },
        });
        break;
    }

    for (const user of users) {
      // Send email notification
      await this.emailService.sendNotificationEmail(
        user.email,
        notificationDto.title,
        notificationDto.message,
      );

      // Here you would integrate with a push notification service like Firebase
      // await this.sendPushNotification(user.deviceToken, notificationDto);
    }

    return { message: `Notification sent to ${users.length} users` };
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

    for (const buyer of buyers) {
      await this.emailService.sendNotificationEmail(
        buyer.email,
        'Donor Available in Your Area',
        `A milk donor is now available in your area (${donor.zipCode}).`,
      );
      // Send push notification
      // await this.sendPushNotification(buyer.deviceToken, {...});
    }
  }

  async notifyOnRequestUpdate(requestId: string, status: string, recipientId: string) {
    const recipient = await this.userRepository.findOne({
      where: { id: recipientId },
    });

    if (!recipient) {
      return;
    }

    await this.emailService.sendNotificationEmail(
      recipient.email,
      'Request Update',
      `Your request (${requestId}) has been ${status}.`,
    );
    // Send push notification
    // await this.sendPushNotification(recipient.deviceToken, {...});
  }
}
