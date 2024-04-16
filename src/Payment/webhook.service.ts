import { Injectable, Req, Res } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
// Import your OrderEntity here
import { OrderRepository } from 'src/order/order.reposiroty';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/Entity/orders.entity';
import { PaymentStatus } from 'src/Enums/all-enums';

@Injectable()
export class PaystackWebhookService {
  constructor(@InjectRepository(OrderEntity)private readonly orderRepo: OrderRepository){}
 

   handleWebhook(req: Request, res: Response): void {
   
    try {
      
      // Validate event
      const hash = crypto
        .createHmac('sha512', "sk_test_c86ebe0afdc2c1f27920173207a28287c956b1eb")
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash === req.headers['x-paystack-signature']) {
        // Retrieve the request's body
        const event = req.body;
        if (event.event === 'charge.success'){
          this.handleChargeSuccessEvent(event.data.reference)
        }else{
          console.log("Unsupported Paystack webhook event",event.event)
        }
        // Do something with event
        console.log('Paystack webhook event:', event);
      } else {
        console.error('Invalid Paystack webhook signature');
      }
    } catch (error) {
      console.error('Error handling Paystack webhook:', error);
    } finally {
      res.sendStatus(200);
    }
  }

  private async handleChargeSuccessEvent(orderReference: number) {
    try {
      // Find the order by its reference (assuming you store order references in your database)
      const order = await this.orderRepo.findOne({
        where: { id: orderReference },
      });

      if (order) {
        // Update the order's payment status to successful
        order.payment_status = PaymentStatus.SUCCESSFUL; // Update with your actual payment status enum/type
        await this.orderRepo.save(order);

        console.log(
          'Order payment status updated successfully:',
          orderReference,
        );
      } else {
        console.error('Order not found for reference:', orderReference);
      }
    } catch (error) {
      console.error('Error handling charge success event:', error);
    }
  }
}
