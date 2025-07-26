import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Your OTP for Mom\'s Milk',
      html: `
        <h1>Welcome to Mom's Milk</h1>
        <p>Your OTP for verification is: <strong>${otp}</strong></p>
        <p>This OTP will expire in 5 minutes.</p>
        <p>If you didn't request this OTP, please ignore this email.</p>
      `,
    });
  }

  async sendNotificationEmail(email: string, title: string, message: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: title,
      html: `
        <h1>${title}</h1>
        <p>${message}</p>
      `,
    });
  }
}
