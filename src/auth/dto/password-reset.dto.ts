import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail({}, { message: 'Adresa de email nu este validă' })
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Token-ul este obligatoriu' })
  @IsNotEmpty({ message: 'Token-ul nu poate fi gol' })
  token: string;

  @IsString({ message: 'Parola este obligatorie' })
  @MinLength(8, { message: 'Parola trebuie să aibă cel puțin 8 caractere' })
  newPassword: string;
}
