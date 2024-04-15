import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'the official Api of the ostra logistics application!';
  }
}
