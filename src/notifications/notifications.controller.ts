import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationDto } from '../auth/dto/auth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser, Roles } from '../auth/decorators';
import { UserRole } from '../users/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @Roles(UserRole.ADMIN)
  async sendNotification(@Body() notificationDto: NotificationDto) {
    return this.notificationsService.sendNotification(notificationDto);
  }
}
