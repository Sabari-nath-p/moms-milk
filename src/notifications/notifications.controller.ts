import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationDto } from '../auth/dto/auth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser, Roles } from '../auth/decorators';
import { User, UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiTags('Notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post('send')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send notification to users' })
  async sendNotification(@Body() notificationDto: NotificationDto) {
    return this.notificationsService.sendNotification(notificationDto);
  }

  @Post('fcm-token')
  @ApiOperation({ summary: 'Update user FCM token for push notifications' })
  async updateFCMToken(
    @GetUser() user: User,
    @Body('fcmToken') fcmToken: string,
  ) {
    return this.notificationsService.updateUserFCMToken(user.id, fcmToken);
  }
}
