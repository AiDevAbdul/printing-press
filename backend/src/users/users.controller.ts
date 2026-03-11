import { Controller, Get, Post, Body, Patch, Put, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, UpdateUserProfileDto, UpdateUserPermissionsDto, SetSubstituteUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { SubstituteService } from './substitute.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly substituteService: SubstituteService,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.usersService.getAllUsers(limit, offset);
  }

  @Get('profile')
  async getProfile(@Request() req): Promise<UserResponseDto> {
    return this.usersService.getUserProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserProfile(req.user.id, updateProfileDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Get(':id/profile')
  @Roles(UserRole.ADMIN)
  getUserProfile(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.getUserProfile(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Put(':id/permissions')
  @Roles(UserRole.ADMIN)
  async updatePermissions(
    @Param('id') id: string,
    @Body() updatePermissionsDto: UpdateUserPermissionsDto,
    @Request() req,
  ): Promise<UserResponseDto> {
    return this.usersService.updateUserPermissions(id, updatePermissionsDto, req.user.id);
  }

  @Post(':id/substitute')
  @Roles(UserRole.ADMIN)
  async setSubstituteUser(
    @Param('id') id: string,
    @Body() setSubstituteDto: SetSubstituteUserDto,
  ) {
    return this.substituteService.setSubstituteUser(id, setSubstituteDto);
  }

  @Delete(':id/substitute')
  @Roles(UserRole.ADMIN)
  async removeSubstituteUser(@Param('id') id: string) {
    return this.substituteService.removeSubstituteUser(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}

