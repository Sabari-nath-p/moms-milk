import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { LoginDto, RegisterDto, VerifyOtpDto } from './dto/auth.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private otpStore: Map<string, { otp: string; timestamp: number }> = new Map();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, role } = registerDto;

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(email, { otp, timestamp: Date.now() });

    // Send OTP email
    await this.emailService.sendOTPEmail(email, otp);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: role as UserRole,
    });

    await this.userRepository.save(user);

    // Generate and send OTP
    await this.sendOtp(email);

    return { message: 'Registration successful. Please verify your email with OTP.' };
  }

  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate and send OTP
    await this.sendOtp(email);

    return { token: this.generateToken(user) };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ token: string }> {
    const { email, otp } = verifyOtpDto;
    const storedOtp = this.otpStore.get(email);

    if (!storedOtp || storedOtp.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Check if OTP is expired (5 minutes validity)
    if (Date.now() - storedOtp.timestamp > 5 * 60 * 1000) {
      this.otpStore.delete(email);
      throw new UnauthorizedException('OTP expired');
    }

    // Clear OTP after successful verification
    this.otpStore.delete(email);

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update email verification status
    user.isEmailVerified = true;
    await this.userRepository.save(user);
    
    return { token: this.generateToken(user) };
  }

  private generateToken(user: User): string {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  private async sendOtp(email: string): Promise<void> {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with timestamp
    this.otpStore.set(email, { otp, timestamp: Date.now() });

    // Send OTP via email
    await this.emailService.sendOTPEmail(email, otp);
  }
}
