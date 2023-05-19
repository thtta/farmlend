import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SuccessResponse } from './globals/utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return SuccessResponse(process.env.npm_package_description, {
      service: process.env.npm_package_name,
      version: process.env.npm_package_version,
    });
  }
}
