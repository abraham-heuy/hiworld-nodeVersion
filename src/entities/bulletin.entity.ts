import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('bulletins')
export class Bulletin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  text!: string;

  @Column({ length: 255 })
  author!: string;

  @Column({ type: 'timestamp' })
  date!: Date;

  @Column({ length: 255 })
  title!: string;
}