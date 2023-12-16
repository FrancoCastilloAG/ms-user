import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() userLoginDto: UserLoginDto) {
    return await this.authService.login(userLoginDto);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.register(createUserDto);
  }

  @Post('change-password')
  async changePassword(@Body() passwordData: { userId: string; currentPassword: string; newPassword: string }) {
    try {
      const result = await this.authService.changePassword(passwordData);

      return { message: result };
    } catch (error: any) {
      // Agregar un tipo explícito para 'error'
      return { error: error.message || 'Error desconocido' };
    }
  }

  @Post('verify-password')
  async verifyPassword(@Body() passwordData: { userId: string; enteredPassword: string }): Promise<boolean> {
    try {
      const isPasswordValid = await this.authService.verifyPassword(
        passwordData.userId,
        passwordData.enteredPassword,
      );

      return isPasswordValid;
    } catch (error) {
      return false;
    }
  }

  @Post('recover-password')
  async recoverPassword(@Body() data: { email: string }) {
    return this.authService.requestPasswordReset(data.email);
  }

  @Post('verify-and-change-password')
  async verifyAndChangePassword(@Body() passwordResetDto: { code: string; newPassword: string }) {
    return this.authService.verifyAndChangePassword(passwordResetDto.code, passwordResetDto.newPassword);
  }
}
