import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    dotenv.config();
    // Simulate fetching data from Kraken API periodically
    setInterval(() => {
      const typeData = process.env.Type;
      const nameData = process.env.Name;
      this.appService.emitKrakenData(typeData, nameData);
    }, 1000);
  }
}
