import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class SelectCompanyDto {
  @IsUUID()
  company_id: string;
}

export class CompanyInfo {
  id: string;
  name: string;
}

export class LoginResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  companies: CompanyInfo[];
  selected_company?: CompanyInfo;
}

export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    company_id: string;
  };
}
