import { Injectable, Res,  } from '@nestjs/common';
import * as crypto from 'crypto';
import { Response } from 'express';

@Injectable()
export class WebhookService{
  constructor(){}

  async handleWebhook(@Res() res: Response,body:any,header:any){
    try {
        const hash = crypto
        .createHmac('sha512',process.env.PAYSTACK_TEST_SECRET)
        .update(JSON.stringify(body))
        .digest('hex')

        if (hash === header['x-paystack-signature']){
            console.log({data:body})

             // Route the event based on the event type
        if (body.event === 'charge.success') {
            this.handleChargeSuccessEvent(body);

          }else if (body.event === 'charge.failure') {
            this.handleChargeFailureEvent(body);
          }
          res.status(200).send('Webhook processed successfully');


        } else {
        res.status(400).send('Invalid webhook request');
      }
        
    } catch (error) {
        throw error
        
    }
  }


  private handleChargeSuccessEvent(eventData: any) {
    // Extract relevant data from the event payload
    const { data } = eventData;
    const { amount, customer, transaction } = data;

    // Process the successful charge event
    // Example: Update your database, send a confirmation email, or trigger other actions
    // For now, just log the data as an example
    console.log('Charge Success Event Data:', {
      amount,
      customer,
      transaction,
    });
  }

  private handleChargeFailureEvent(eventData: any) {
    // Extract relevant data from the event payload
    const { data } = eventData;
    const { amount, customer, transaction } = data;

    // Process the charge failure event
    // Example: Log the event for investigation, send a notification to the user, or trigger other actions
    // For now, just log the data as an example
    console.log('Charge Failure Event Data:', {
      amount,
      customer,
      transaction,
    });
  }
}


