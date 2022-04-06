import { IsOptional, IsString } from 'class-validator';

export class UpdateMenuInput {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
