import { IsEmail, IsOptional, IsString, MinLength, IsEnum, Matches } from 'class-validator';
import { PersonType } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail({}, { message: 'Email invalid' })
  email?: string;

  @IsOptional()
  @IsEnum(PersonType, { message: 'Tipul de persoană trebuie să fie FIZICA sau JURIDICA' })
  personType?: PersonType;

  // Pentru persoane fizice
  @IsOptional()
  @IsString({ message: 'Prenumele trebuie să fie text' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Numele trebuie să fie text' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'CNP-ul trebuie să fie text' })
  @Matches(/^\d{13}$/, { message: 'CNP-ul trebuie să aibă 13 cifre' })
  cnp?: string;

  // Pentru persoane juridice
  @IsOptional()
  @IsString({ message: 'Numele companiei trebuie să fie text' })
  companyName?: string;

  @IsOptional()
  @IsString({ message: 'CUI-ul trebuie să fie text' })
  cui?: string;

  @IsOptional()
  @IsString({ message: 'Numărul de înregistrare trebuie să fie text' })
  regCom?: string;

  // Date comune
  @IsOptional()
  @IsString({ message: 'Telefonul trebuie să fie text' })
  @Matches(/^\+40\d{9}$/, { message: 'Telefonul trebuie să fie în formatul +40xxxxxxxxx' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Adresa trebuie să fie text' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'Orașul trebuie să fie text' })
  city?: string;

  @IsOptional()
  @IsString({ message: 'Județul trebuie să fie text' })
  county?: string;

  @IsOptional()
  @IsString({ message: 'Codul poștal trebuie să fie text' })
  @Matches(/^\d{6}$/, { message: 'Codul poștal trebuie să aibă 6 cifre' })
  postalCode?: string;

  @IsOptional()
  @IsString({ message: 'Țara trebuie să fie text' })
  country?: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'Parola curentă este obligatorie' })
  currentPassword: string;

  @IsString({ message: 'Parola nouă este obligatorie' })
  @MinLength(8, { message: 'Parola nouă trebuie să aibă cel puțin 8 caractere' })
  newPassword: string;

  @IsString({ message: 'Confirmarea parolei este obligatorie' })
  confirmPassword: string;
}

export class DeleteAccountDto {
  @IsString({ message: 'Parola este obligatorie pentru ștergerea contului' })
  password: string;
}
