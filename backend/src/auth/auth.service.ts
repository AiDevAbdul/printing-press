import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, AuthResponseDto, LoginResponseDto, SelectCompanyDto, CompanyInfo } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get all companies the user belongs to
    const userCompanies = await this.usersService.getUserCompanies(user.id);

    const companies: CompanyInfo[] = userCompanies.map(company => ({
      id: company.id,
      name: company.name,
    }));

    // If user belongs to only one company, auto-select it
    let selectedCompany: CompanyInfo | undefined;
    if (companies.length === 1) {
      selectedCompany = companies[0];
    }

    // Generate temporary JWT for company selection (no company_id yet)
    const tempPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const access_token = this.jwtService.sign(tempPayload, { expiresIn: '1h' });

    return {
      access_token,
      refresh_token: '',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      companies,
      selected_company: selectedCompany,
    };
  }

  async selectCompany(userId: string, selectCompanyDto: SelectCompanyDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Verify user belongs to this company
    const company = await this.companiesRepository.findOne({
      where: { id: selectCompanyDto.company_id },
    });

    if (!company) {
      throw new BadRequestException('Company not found');
    }

    // Verify user belongs to this company
    const userCompanies = await this.usersService.getUserCompanies(user.id);
    const belongsToCompany = userCompanies.some(c => c.id === selectCompanyDto.company_id);

    if (!belongsToCompany) {
      throw new UnauthorizedException('User does not belong to this company');
    }

    // Generate JWT with company_id
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: selectCompanyDto.company_id,
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        company_id: selectCompanyDto.company_id,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.is_active) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }

  async refreshToken(user: any): Promise<{ access_token: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      company_id: user.company_id,
    };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
    };
  }
}
