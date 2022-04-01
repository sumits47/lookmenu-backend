import {
  IsBoolean,
  IsHexColor,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class UpdatePlaceInput {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsHexColor()
  themeColor?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumberString()
  phoneCode?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsUrl()
  logoURL?: string;

  @IsOptional()
  @IsUrl()
  bgURL?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  wifiName?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  wifiPassword?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  canOrder?: boolean;
}
