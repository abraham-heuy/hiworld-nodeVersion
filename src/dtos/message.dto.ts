import { IsUUID, IsOptional, IsInt, Min, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID()
  receiverId!: string;

  @IsString()
  @MaxLength(5000)
  msg!: string;
}

export class GetConversationDto {
  @IsUUID()
  otherUserId!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 50;
}