import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('layouts')
export class Layout {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  text!: string;

  @Column({ length: 255 })
  author!: string;

  @Column({ type: 'datetime' })
  date!: Date;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'blob' })
  code!: Buffer;
}