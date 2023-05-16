import { DataSource } from 'typeorm';
import { config } from  'dotenv'

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  migrations: ['src/database/migrations/*.ts'],
  entities: ['src/**/*.entity{.ts,.js}'],
});

export default dataSource;