import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('layouts')
export class Layout {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text' })
  text!: string; // description

  @Column({ type: 'text' })
  code!: string; // HTML/CSS layout code (store as text, not blob, for easier editing)

  @Column({ length: 255 })
  author!: string; // user ID

  @CreateDateColumn({ type: 'datetime' })
  date!: Date;
}