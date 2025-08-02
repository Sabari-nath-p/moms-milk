import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  SendOtpDto,
  VerifyOtpDto,
  CompleteProfileDto,
  SetUserRoleDto
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('send-otp')
  @ApiOperation({
    summary: 'Send OTP to email',
    description: 'Sends a 6-digit OTP to the provided email address for verification'
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email format' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP and authenticate user',
    description: 'Verifies the OTP and returns access token. For new users, isNew=true. For existing users, returns user details.'
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        isNew: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            phoneNumber: { type: 'string' },
            zipCode: { type: 'string' },
            role: { type: 'string' },
            status: { type: 'string' },
            profilePicture: { type: 'string' },
            description: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Complete user profile',
    description: 'Completes the user profile with name, phone, and zip code'
  })
  @ApiResponse({ status: 200, description: 'Profile completed successfully' })
  @ApiResponse({ status: 400, description: 'Profile already completed or invalid state' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async completeProfile(@Request() req, @Body() completeProfileDto: CompleteProfileDto) {
    return this.authService.completeProfile(req.user.sub, completeProfileDto);
  }

  @Post('set-role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Set user role',
    description: 'Sets the user role (donor/buyer) and optional description'
  })
  @ApiResponse({ status: 200, description: 'User role set successfully' })
  @ApiResponse({ status: 400, description: 'Must complete profile first or invalid state' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setUserRole(@Request() req, @Body() setUserRoleDto: SetUserRoleDto) {
    return this.authService.setUserRole(req.user.sub, setUserRoleDto);
  }
}
