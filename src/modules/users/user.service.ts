import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>, private readonly jwtService: JwtService,) { }

  private decodeToken(token: string): string {
    const decodedToken = this.jwtService.decode(token);
    const tokenAsJSON = JSON.stringify(decodedToken);
    const idUser = JSON.parse(tokenAsJSON)
    return idUser.id;
  }
  
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(email: string): Promise<User | null> {
    console.log("correo proporcionado", email)
    return await this.userRepository.findOne({
      where: {
        email: email.toLowerCase(), // Comparar en minúsculas para evitar problemas de mayúsculas y minúsculas
      },
    }) || null;
  }

  async findOneById(token: string): Promise<User | null> {
    const tokenData = this.decodeToken(token);
    console.log("tokendata user", tokenData);
    return await this.userRepository.findOne({
      where: {
        id: tokenData,
      },
    }) || null;
  }

  async update(token: string, updateUserDto: UpdateUserDto): Promise<User> {
    const tokenData = this.decodeToken(token);
    const existingUser = await this.userRepository.findOne({ where: { id: tokenData } });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateUserDto.nombre) {
      existingUser.nombre = updateUserDto.nombre;
    }

    if (updateUserDto.password) {
      existingUser.password = updateUserDto.password;
    }

    return await this.userRepository.save(existingUser);
  }

  async updatePasswordByEmail(email: string, newPassword: string): Promise<void> {
    const user = await this.findOne(email);
    if (user) {
      user.password = newPassword;
      await this.updateByEmail(email, user);
    }
  }

  async updateVerificationCodeByEmail(email: string, verificationCode: string): Promise<void> {
    const user = await this.findOne(email);
    if (user) {
      user.verificationCode = verificationCode;
      await this.updateByEmail(email, user);
    }
  }

  async updateByEmail(email: string, updateUserDto: UpdateUserDto): Promise<void> {
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (updateUserDto.nombre) {
      existingUser.nombre = updateUserDto.nombre;
    }

    if (updateUserDto.password) {
      existingUser.password = updateUserDto.password;
    }

    if (updateUserDto.verificationCode) {
      existingUser.verificationCode = updateUserDto.verificationCode;
    }

    await this.userRepository.save(existingUser);
  }

  async findByVerificationCode(verificationCode: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { verificationCode } }) || null;
  }
}