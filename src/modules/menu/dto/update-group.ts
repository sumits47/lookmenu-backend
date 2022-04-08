import { IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class UpdateGroupInput {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsUrl()
  bgURL?: string;
}
