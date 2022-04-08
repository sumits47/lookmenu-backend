import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateGroupInput {
  @IsNotEmpty()
  @IsMongoId()
  category: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsUrl()
  bgURL?: string;
}
