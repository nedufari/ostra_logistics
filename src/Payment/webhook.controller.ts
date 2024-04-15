import { Controller, Post, Res, Body, Headers } from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('paystack-webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleWebhook(@Res() res: Response, @Body() body: any, @Headers() header: any) {
    //await this.webhookService.handleWebhook(res,body,header);
    return 'Webhook processed successfully'; // Replace with appropriate response
  }
}
