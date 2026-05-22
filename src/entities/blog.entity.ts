import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('blogs')
export class Blog {
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

  @Column({ default: 0 })
  kudos!: number;

  @Column()
  category!: string;

  @Column({ name: 'privacy_level' })
  privacyLevel!: number;

  @Column({ default: false })
  pinned!: boolean;
}