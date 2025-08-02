import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import {
  SendOtpDto,
  VerifyOtpDto,
  CompleteProfileDto,
  SetUserRoleDto
} from './dto/auth.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private otpStore: Map<string, { otp: string; timestamp: number }> = new Map();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) { }

  async sendOtp(sendOtpDto: SendOtpDto): Promise<{ message: string }> {
    const { email } = sendOtpDto;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with timestamp (valid for 10 minutes)
    this.otpStore.set(email, {
      otp,
      timestamp: Date.now()
    });

    // Send OTP via email
    await this.emailService.sendOTPEmail(email, otp);

    return { message: 'OTP sent successfully to your email' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
    accessToken: string;
    isNew: boolean;
    user?: Partial<User>;
  }> {
    const { email, otp } = verifyOtpDto;

    // Verify OTP
    const storedOtpData = this.otpStore.get(email);
    if (!storedOtpData) {
      throw new UnauthorizedException('OTP not found or expired');
    }

    const { otp: storedOtp, timestamp } = storedOtpData;
    const isOtpExpired = Date.now() - timestamp > 10 * 60 * 1000; // 10 minutes

    if (isOtpExpired) {
      this.otpStore.delete(email);
      throw new UnauthorizedException('OTP has expired');
    }

    if (otp !== storedOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Remove OTP after successful verification
    this.otpStore.delete(email);

    // Check if user exists
    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Create new user with minimal data
      user = this.userRepository.create({
        email,
        isEmailVerified: true,
        status: UserStatus.PROFILE_INCOMPLETE
      });
      await this.userRepository.save(user);

      // Generate token
      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        isNew: true
      };
    } else {
      // Update existing user
      user.isEmailVerified = true;
      await this.userRepository.save(user);

      // Generate token
      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        isNew: false,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          zipCode: user.zipCode,
          role: user.role,
          status: user.status,
          profilePicture: user.profilePicture,
          description: user.description
        }
      };
    }
  }

  async completeProfile(userId: string, completeProfileDto: CompleteProfileDto): Promise<{
    message: string;
    user: Partial<User>;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.PROFILE_INCOMPLETE) {
      throw new BadRequestException('Profile is already completed or user is in wrong state');
    }

    // Update user profile
    Object.assign(user, {
      ...completeProfileDto,
      status: UserStatus.ROLE_SELECTION_PENDING
    });

    await this.userRepository.save(user);

    return {
      message: 'Profile completed successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        zipCode: user.zipCode,
        status: user.status,
        profilePicture: user.profilePicture
      }
    };
  }

  async setUserRole(userId: string, setUserRoleDto: SetUserRoleDto): Promise<{
    message: string;
    user: Partial<User>;
  }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ROLE_SELECTION_PENDING) {
      throw new BadRequestException('User must complete profile first or is in wrong state');
    }

    // Update user role and status
    user.role = setUserRoleDto.role;
    user.description = setUserRoleDto.description || null;
    user.status = UserStatus.COMPLETED;

    await this.userRepository.save(user);

    return {
      message: 'User role set successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        zipCode: user.zipCode,
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
        description: user.description
      }
    };
  }
}
