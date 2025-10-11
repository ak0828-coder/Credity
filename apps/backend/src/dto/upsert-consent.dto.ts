import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { ConsentType } from '@prisma/client';

export class UpsertConsentDto {
  @IsEnum(ConsentType)
  type!: ConsentType;

  @IsString()
  version!: string;

  @IsBoolean()
  status!: boolean;
}
