import { IsEmail, IsString, IsNotEmpty, IsEnum, IsOptional, ValidateIf } from 'class-validator';

export enum PersonType {
  FIZICA = 'fizica',
  JURIDICA = 'juridica',
}

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(PersonType)
  personType: PersonType;

  // Pentru persoane fizice
  @ValidateIf(o => o.personType === PersonType.FIZICA)
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ValidateIf(o => o.personType === PersonType.FIZICA)
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsString()
  cnp?: string;

  // Pentru persoane juridice
  @ValidateIf(o => o.personType === PersonType.JURIDICA)
  @IsString()
  @IsNotEmpty()
  companyName?: string;

  @ValidateIf(o => o.personType === PersonType.JURIDICA)
  @IsString()
  @IsNotEmpty()
  cui?: string;

  @ValidateIf(o => o.personType === PersonType.JURIDICA)
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
