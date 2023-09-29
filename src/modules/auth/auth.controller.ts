import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @Post('login')
  async login(@Body() UserLoginDto: UserLoginDto){
    return await this.authService.login(UserLoginDto);
  }
  @Post('register')
  async register(@Body() CreateUserDto: CreateUserDto){
    return await this.authService.register(CreateUserDto);
  }
}