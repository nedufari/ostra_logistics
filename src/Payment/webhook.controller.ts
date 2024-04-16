import { Controller, Post, Res, Body, Headers, Req } from '@nestjs/common';
import { PaystackWebhookService } from './webhook.service';
import { Request, Response } from 'express';

@Controller('paystack-webhook')
export class WebhookController {
  constructor(private readonly webhookService: PaystackWebhookService) {}

  @Post('/')
  async handleWebhook(@Res() res: Response, @Req() req: Request) {
    return await this.webhookService.handleWebhook(req, res);
  }
}
