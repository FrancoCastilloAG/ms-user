import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserLoginDto } from './dto/login-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'franco.castillo2811@gmail.com',
      pass: 'jixy smdp mqvn arud',
    },
  });

  async sendVerificationCodeEmail(email: string, code: string): Promise<void> {
    const subject = 'Recuperación de contraseña - Código de verificación';
    const text = `Su código de verificación es: ${code}`;
  
    try {
      await this.transporter.sendMail({
        from: 'tu_correo@gmail.com',
        to: email,
        subject,
        text,
      });
  
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error('Error sending verification code email:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<{ message?: string; error?: string }> {
    const user = await this.userService.findOne(email);

    if (!user) {
      return { error: 'Usuario no encontrado' };
    }

    const verificationCode = this.generateVerificationCode();
    await this.userService.updateVerificationCodeByEmail(user.email, verificationCode);

    await this.sendVerificationCodeEmail(user.email, verificationCode);

    return { message: 'Código de verificación enviado exitosamente' };
  }

  async verifyAndChangePassword(code: string, newPassword: string): Promise<{ message?: string; error?: string }> {
    const user = await this.userService.findByVerificationCode(code);

    if (!user) {
      return { error: 'Código de verificación inválido o expirado' };
    }

    await this.userService.updateVerificationCodeByEmail(user.email, '');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userService.updatePasswordByEmail(user.email, hashedPassword);

    return { message: 'Contraseña cambiada con éxito' };
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private readonly passwordRegex = /^(?=.*[a-zA-Z]\w*[a-zA-Z])(?=.*\d\d).{8,}$/;

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async login(userLoginDto: UserLoginDto): Promise<{ token?: string; error?: string }> {
    const user = await this.userService.findOne(userLoginDto.email);

    if (!user) {
      console.log('Usuario no encontrado');
      return {
        error: 'email incorrecta'
      };
    }

    const isPasswordValid = await bcrypt.compare(userLoginDto.password, user.password);
    if (!isPasswordValid) {
      console.log('Contraseña incorrecta');
      return {
        error: 'Contraseña incorrecta'
      };
    }

    const payload = user.getInfoToken();
    const token = this.jwtService.sign(payload);

    return {
      token: token,
    };
  }

  async register(createUserDto: CreateUserDto): Promise<{ message?: string; token?: string; error?: string }> {
    if (!this.emailRegex.test(createUserDto.email)) {
      return { error: 'Formato de correo electrónico inválido' };
    }

    if (!this.passwordRegex.test(createUserDto.password)) {
      return { error: 'Formato de contraseña inválido' };
    }

    const nombreLength = createUserDto.nombre.length;
    if (nombreLength < 4 || nombreLength > 16) {
      return { error: 'El nombre debe tener entre 4 y 16 caracteres' };
    }

    const existingUser = await this.userService.findOne(createUserDto.email);
    if (existingUser) {
      return { error: 'Usuario ya existe' };
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    createUserDto.password = hashedPassword;

    const newUser = await this.userService.create(createUserDto);

    const payload = newUser.getInfoToken();
    const token = this.jwtService.sign(payload);

    return {
      message: 'Usuario creado con éxito',
      token: token,
    };
  }

  async changePassword(passwordData: { userId: string; currentPassword: string; newPassword: string }): Promise<string | { error: string }> {
    if (!this.passwordRegex.test(passwordData.newPassword)) {
      return { error: 'Formato de contraseña inválido' };
    }

    try {
      const user = await this.userService.findOneById(passwordData.userId);

      if (!user) {
        console.error('Usuario no encontrado');
        throw new Error('Usuario no encontrado');
      }

      const isPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.password);

      if (!isPasswordValid) {
        console.error('Contraseña actual incorrecta');
        throw new Error('Contraseña actual incorrecta');
      }

      const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);

      user.password = hashedPassword;
      await this.userService.update(passwordData.userId, user);

      return 'Contraseña cambiada con éxito';
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  async verifyPassword(userId: string, enteredPassword: string): Promise<boolean> {
    try {
      const user = await this.userService.findOneById(userId);

      if (!user) {
        console.error('Usuario no encontrado');
        throw new Error('Usuario no encontrado');
      }

      const isPasswordValid = await bcrypt.compare(enteredPassword, user.password);

      return isPasswordValid;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}
