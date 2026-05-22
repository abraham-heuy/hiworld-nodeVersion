import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('favorites')
export class Favorite {
  @PrimaryColumn({ type: 'uuid' })
  user_id!: string;

  @Column({ type: 'json', nullable: true })
  favorites?: {
    blogs: string[];
    users: string[];
    layouts: string[];
  };
}