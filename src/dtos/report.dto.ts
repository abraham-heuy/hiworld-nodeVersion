import { IsUUID, IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @IsUUID()
  targetUserId!: string; // user being reported (or content owner)

  @IsInt()
  @Min(1)
  @Max(10)
  contentType!: number;

  @IsUUID()
  contentId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}