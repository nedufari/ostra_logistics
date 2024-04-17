import { Injectable, Req, Res } from '@nestjs/common';
import * as crypto from 'crypto';
import { Request, Response } from 'express';
// Import your OrderEntity here
import { OrderRepository } from 'src/order/order.reposiroty';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/Entity/orders.entity';
import { PaymentStatus } from 'src/Enums/all-enums';
import * as nanoid from 'nanoid'

@Injectable()
export class PaystackWebhookService {
  constructor(@InjectRepository(OrderEntity)private readonly orderRepo: OrderRepository){}
 
  //generaete 
  public generateTrackingID():string{
  const trackingcode = nanoid.customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz',8)
  return trackingcode()
}

 //generaete 
 public generateDropOffCode():string{
  const dropoffcode = nanoid.customAlphabet('1234567890',6)
  return dropoffcode()
 }



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
      const order = await this.orderRepo.findOne({ where: { id: orderReference } });
  
      if (order) {
        order.payment_status = PaymentStatus.SUCCESSFUL;
        const trackingToken = `osl-${this.generateTrackingID()}`;
        const dropoffCode = this.generateDropOffCode();
        order.trackingID = trackingToken;
        order.dropoffCode = dropoffCode;
        await this.orderRepo.save(order);
  
        console.log('Order payment status updated successfully:', orderReference, 'trackingID:', order.trackingID, 'dropoffCode:', order.dropoffCode);
        
        // Return the tracking ID and dropoff code in the response
        return {
          trackingID: order.trackingID,
          dropoffCode: order.dropoffCode,
        };
      } else {
        console.error('Order not found for reference:', orderReference);
      }
    } catch (error) {
      console.error('Error handling charge success event:', error);
    }
  }
  
}
