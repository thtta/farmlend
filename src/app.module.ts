import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationModule } from './modules/organization/organization.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';

const envFilePath =
  process.env.NODE_ENV === 'testing' ? '.testing.env' : '.env';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: envFilePath,
      load: [config],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('db.HOST'),
        port: configService.get('db.PORT'),
        username: configService.get('db.USERNAME'),
        password: configService.get('db.PASSWORD'),
        database: configService.get('db.NAME'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'testing' ? true : false,
      }),
      inject: [ConfigService],
    }),
    OrganizationModule,
    ProductModule,
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
