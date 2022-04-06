import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMenuInput {
  @IsNotEmpty()
  @IsMongoId()
  place: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
