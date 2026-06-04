import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'hiworld_db',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: false,
  entities: [path.join(__dirname, '../entities/*.ts')],
  migrations: [path.join(__dirname, './migrations/*.ts')],
  subscribers: [path.join(__dirname, '../subscribers/*.ts')],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});