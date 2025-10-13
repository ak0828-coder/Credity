import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  // MinLength ist optional für Login, hilft aber bei klaren Fehlermeldungen
  @IsString()
  @MinLength(8, { message: 'Passwort zu kurz (min. 8 Zeichen).' })
  password!: string;
}
