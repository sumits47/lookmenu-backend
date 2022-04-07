import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCategoryInput {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}
