import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toLowerCase(),
  )
  @IsEmail({}, { message: 'Ungültige E-Mail.' })
  email!: string;

  // Policy: min. 8 Zeichen; mindestens 1 Buchstabe + 1 Zahl (Sonderzeichen optional)
  @IsString()
  @MinLength(8, { message: 'Passwort zu kurz (min. 8 Zeichen).' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'Passwort muss mind. 1 Buchstaben und 1 Zahl enthalten.',
  })
  password!: string;

  @IsOptional()
  @IsString()
  captchaToken?: string | null;
}

export class LoginDto {
  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toLowerCase(),
  )
  @IsEmail({}, { message: 'Ungültige E-Mail.' })
  email!: string;

  @IsString()
  @Length(1, 200)
  password!: string;

  @IsOptional()
  @IsString()
  captchaToken?: string | null;
}
