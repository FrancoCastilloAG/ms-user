import { Controller, Get, Post, Body, Put, Param, NotFoundException } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get(':email')
  async findOne(@Param('email') email: string) {
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('profile/:id')
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOneById(id);

      if (!user) {
        return { message: 'Usuario no encontrado' };
      }

      return user;
    } catch (error) {
      return { message: 'Error al buscar el usuario' };
    }
  }

  @Put(':id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);

      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado');
      }

      return updatedUser;
    } catch (error) {
      return { message: 'Error al actualizar el usuario' };
    }
  }
}
