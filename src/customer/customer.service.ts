import {
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/Entity/customers.entity';
import { OrderEntity } from 'src/Entity/orders.entity';
import { OrderRepository } from 'src/order/order.reposiroty';
import { CustomerRepository } from './customer.repository';
import { DistanceService } from 'src/common/services/distance.service';
import { GeoCodingService } from 'src/common/services/goecoding.service';
import { BidActionDto, OrderDto, counterBidDto } from 'src/common/common.dto';
import { BidStatus, BiddingAction, OrderStatus, PaymentStatus } from 'src/Enums/all-enums';
import { BidEntity, IBids } from 'src/Entity/bids.entity';
import { BidRepository } from 'src/common/common.repositories';
import axios from 'axios';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: CustomerRepository,
    @InjectRepository(BidEntity)
    private readonly bidRepo: BidRepository,
    private distanceservice: DistanceService,
    private geocodingservice: GeoCodingService,
  ) {}

  async PlaceOrder(customerID: string, dto: OrderDto) {
    //findcustomer
    const customer = await this.customerRepo.findOne({
      where: { id: customerID },
    });
    if (!customer)
      throw new NotAcceptableException(
        `customer with id ${customerID} not found`,
      );

    //extract the long and latitude from both the drop off and take off
    const pickUpCordinates = await this.geocodingservice.getYahooCoordinates(
      dto.pickup_address,
    );
    const dropOffCordinates = await this.geocodingservice.getYahooCoordinates(
      dto.dropOff_address,
    );

    //calculate the distance from the values of the longitude and latitude of tboth points

    const distance = this.distanceservice.calculateDistance(
      pickUpCordinates,
      dropOffCordinates,
    );

    const roundDistance = Math.round(distance);

    //calculation for the bidding flat rate by multiplying 100 by 1km
    const flatrate = roundDistance * 4.25;

    //create the order
    const order = new OrderEntity();
    order.customer = customer;
    order.parcel_name = dto.parcel_name;
    order.product_category = dto.product_category;
    order.quantity = dto.quantity;
    order.parcelWorth = dto.parcelWorth;
    order.weight_of_parcel = dto.weight_of_parcel;
    order.describe_weight_of_parcel = dto.describe_weight_of_parcel;
    order.note_for_rider = dto.note_for_rider;

    order.pickup_address = dto.pickup_address;
    order.pickup_phone_number = dto.pickup_phone_number;
    order.Area_of_pickup = dto.Area_of_pickup;
    order.landmark_of_pickup = dto.landmark_of_pickup;

    order.Recipient_name = dto.Recipient_name;
    order.Recipient_phone_number = dto.Recipient_phone_number;
    order.dropOff_address = dto.dropOff_address;
    order.house_apartment_number_of_dropoff =
      dto.house_apartment_number_of_dropoff;
    order.Area_of_dropoff = dto.Area_of_dropoff;
    order.landmark_of_dropoff = dto.landmark_of_dropoff;

    order.vehicleType = dto.vehicleType;
    order.delivery_type = dto.delivery_type;
    order.schedule_date = dto.schedule_date;

    order.pickupLat = pickUpCordinates.lat;
    order.pickupLong = pickUpCordinates.lon;
    order.dropOffLat = dropOffCordinates.lat;
    order.dropOffLong = dropOffCordinates.lon;
    order.distance = roundDistance;

    order.initial_cost = flatrate;
    order.bidStatus = BidStatus.PENDING;
    order.vehicleType = dto.vehicleType;
    order.payment_status = PaymentStatus.PENDING;
    order.order_status = OrderStatus.BIDDING_ONGOING;
    order.orderCreatedAtTime = new Date()

    await this.orderRepo.save(order);

    

    return order;

    //
  }

  //biding process
  //1. accept or decline bid

  async AcceptORDeclineBid(
    dto: BidActionDto,
    orderID: number,
    customerID: string,
    bidID:number
  ):Promise<IBids> {
    try{
    const customer = await this.customerRepo.findOne({
     
       where: { id: customerID },
     });
     console.log("customer",customer)
 
     //check customer
     if (!customer)
       throw new NotAcceptableException(
         `customer with id ${customerID} not found`,
       );
 
       //check the order
     const order = await this.orderRepo.findOne({ where: { id: orderID },relations: ['customer'],  });
     console.log("order",order)
     if (!order)
       throw new NotFoundException(
         `the order with the ID ${orderID} does not exist`,
       );
 
       //check bid
       const bid = await this.bidRepo.findOne({ where: { id: bidID } });
       console.log("bid",bid)
     if (!bid)
       throw new NotFoundException(
         `the bid with the ID ${bidID} does not exist`,
       );
 
 
 
       //check if bid is accepted by the customer that placed the order
     if (order && order.customer.id !== customer.id)
       throw new NotAcceptableException(
         `This customer ${customer.lastname} is not the same with the customer ${order.customer.lastname} that placed this order, therefore, you are not allowed to accept or decline this bid`,
       );
 
       //accept or decline bid 
 
       if (dto && dto.action === BiddingAction.ACCEPT){
         //update the order table 
         order.bidStatus = BidStatus.ACCEPTED
         order.accepted_cost_of_delivery = bid.bid_value
         await this.orderRepo.save(order)
 
         //update the bid entity 
         bid.bidStatus = BidStatus.ACCEPTED
         bid.order = order
         bid.BidAcceptedAt = new Date()
         await this.bidRepo.save(bid)
 
         //notification for accepted bid
  
       }
 
       else if (dto && dto.action === BiddingAction.DECLINE){
       //update the order table 
         order.bidStatus = BidStatus.DECLINED
         await this.orderRepo.save(order)
 
       //update the bid entity 
         bid.bidStatus = BidStatus.DECLINED
         bid.order = order
         bid.BidDeclinedAt =new Date()
         await this.bidRepo.save(bid)
 
         //notification for declined bid
 
 
      }
      return bid
     } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('something went wrong while trying to accept or decline bid, please try again')
      
     }
  }




  //2. counterbid with an offer
  async CounterBid(dto:counterBidDto,orderID:number, customerID:string, bidID:number):Promise<IBids>{
    try {
      const customer = await this.customerRepo.findOne({
        where: { id: customerID },
      });
  
      //check customer
      if (!customer)
        throw new NotAcceptableException(
          `customer with id ${customerID} not found`,
        );
  
        //check the order
      const order = await this.orderRepo.findOne({ where: { id: orderID } });
      if (!order)
        throw new NotFoundException(
          `the order with the ID ${orderID} does not exist`,
        );
  
        //check bid
        const bid = await this.bidRepo.findOne({ where: { id: bidID } });
      if (!bid)
        throw new NotFoundException(
          `the bid with the ID ${bidID} does not exist`,
        );
  
  
  
        //check if bid is accepted by the customer that placed the order
      if (order && order.customer !== customer)
        throw new NotAcceptableException(
          `This customer ${customer.lastname} is not the same with the customer ${order.customer.lastname} that placed this order, therefore, you are not allowed to accept or decline this bid`,
        );

       // Check if order already has a counter offer (enforces one-time counter)
    if (bid.bidStatus === BidStatus.COUNTERED) {
      throw new NotAcceptableException('Counter offer can only be made once for this order');
    }
  
      //counter the bid 
      bid.counter_bid_offer = dto.counter_bid
      bid.counteredAt = new Date()
      bid.bidStatus = BidStatus.COUNTERED
  
      await this.bidRepo.save(bid)
  
      //update ordertable 
      order.bidStatus =BidStatus.COUNTERED
  
      return 
  
        
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('something went wrong during counter offer, please try again later ')
      
    }

  }



  // after bid is being finalized make payment and confirm payment the response will be a payment success and a tracking number for

  async  processPayment(order: OrderEntity): Promise<PaymentResponse> {
    try {
      // Check if order is ready for payment (bid accepted)
      if (order.bidStatus !== BidStatus.ACCEPTED) {
        throw new NotAcceptableException('Order cannot be paid for. Bid is not yet accepted');
      }
  
      // Paystack payment integration
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: order.accepted_cost_of_delivery * 100, // Convert to kobo (Paystack currency)
          email: order.customer.email, // Customer email for reference
          reference: order.id.toString(), // Order ID as payment reference
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
            'Content-Type': 'application/json',
          },
        },
      );
  
      if (response.data.status === true) {
        const paymentUrl = response.data.data.authorization_url;
  
        // Redirect user to Paystack payment page
        window.location.href = paymentUrl;  // Assuming this is a browser-based environment
  
        // Alternatively, return the payment URL for redirection on the server-side
        // return { success: true, paymentUrl };
  
        // Payment confirmation logic (to be implemented later)
        // This will be triggered by Paystack's webhook notification
      } else {
        throw new InternalServerErrorException('Payment initialization failed. Please try again later');
      }

      return
    } catch (error) {
      console.error(error);
      let errorMessage = 'Payment processing failed. Please try again later';
  
      // Handle specific Paystack errors (optional)
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message;
      }
  
      throw new InternalServerErrorException(errorMessage);
    }
  }
  
  // This function will be called by Paystack's webhook to confirm payment
  async  handlePaymentConfirmation(data: any) {
    const reference = data.reference; // Extract payment reference from webhook data
    const order = await this.orderRepo.findOne({ where: { id: reference } });
  
    if (order && data.status === 'success') {
      order.payment_status = PaymentStatus.SUCCESSFUL;
      await this.orderRepo.save(order);
  
      // Notify user about successful payment (optional)
    } else {
      console.error('Payment confirmation failed:', data);
      // Handle payment failure scenarios (optional)
    }
  }
  
  
  


  // track order
}
