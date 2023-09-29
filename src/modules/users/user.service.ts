import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>){}

  async create(createUserDto: CreateUserDto) {
    const User = this.userRepository.create(createUserDto);
    return await this.userRepository.save(User);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(email: string) {
    const User = await this.userRepository.findOne(
      {
        where:{
          email:email
        }
      }
    );

    if(User){
      return User;
    }
    return null;
  }
}