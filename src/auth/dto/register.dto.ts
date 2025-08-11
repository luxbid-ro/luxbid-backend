import { IsEmail, IsString, IsNotEmpty, IsEnum, IsOptional, ValidateIf, IsIn } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsIn(['FIZICA', 'JURIDICA'])
  personType: 'FIZICA' | 'JURIDICA';

  // Pentru persoane fizice
  @ValidateIf(o => o.personType === 'FIZICA')
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ValidateIf(o => o.personType === 'FIZICA')
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsString()
  cnp?: string;

  // Pentru persoane juridice
  @ValidateIf(o => o.personType === 'JURIDICA')
  @IsString()
  @IsNotEmpty()
  companyName?: string;

  @ValidateIf(o => o.personType === 'JURIDICA')
  @IsString()
  @IsNotEmpty()
  cui?: string;

  @ValidateIf(o => o.personType === 'JURIDICA')
  @IsString()
  @IsNotEmpty()
  regCom?: string;

  // Date comune
  @IsString()
  @IsNotEmpty()
  phone: string;

  // Adresa de facturare
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  county: string;

  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @IsString()
  @IsOptional()
  country?: string = 'România';
}
