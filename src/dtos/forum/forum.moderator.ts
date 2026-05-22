import { IsUUID } from 'class-validator';

export class AddModeratorDto {
  @IsUUID()
  userId!: string;
}