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
import { BidEvent, BidStatus, BiddingAction, OrderStatus, PaymentStatus } from 'src/Enums/all-enums';
import { BidEntity, IBids } from 'src/Entity/bids.entity';
import { BidRepository } from 'src/common/common.repositories';
import axios from 'axios';
import * as nanoid from 'nanoid';
import { BidEventsService } from 'src/common/Events/bid.events.service';

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
    private  BidEvents:BidEventsService,
  ) {}

  public generateBidGroupID():string{
    const gen = nanoid.customAlphabet('1234567890',3)
    return gen()
  }


  async PlaceOrder(customerID: string, dto: OrderDto | OrderDto[]) {
  try {
    const bidGroupID = this.generateBidGroupID()

      const customer = await this.customerRepo.findOne({
          where: { id: customerID },
      });
      if (!customer)
          throw new NotFoundException('customer not found');
  
      if (Array.isArray(dto)) {
          const existingOrders = await this.orderRepo.find({
              where: { customer: customer, order_status: OrderStatus.BIDDING_ONGOING },
          });
          if (existingOrders.length + dto.length > 3) {
              throw new NotAcceptableException('the limit for multiple order is 3');
          }
  
          const createdOrders: OrderEntity[] = [];
          for (const orderData of dto) {
              const order = await this.createOrder(customer, orderData);
             
              createdOrders.push(order);
          }
          return createdOrders;
      } else {
          return await this.createOrder(customer, dto);
      }
  } catch (error) {
    console.log(error)
    throw new InternalServerErrorException('something went wronng while placing order, please try again')
    
  }
}

private async createOrder(customer: CustomerEntity, dto: OrderDto): Promise<OrderEntity> {
    const pickupCoordinates = await this.geocodingservice.getYahooCoordinates(dto.pickup_address);
    const dropOffCoordinates = await this.geocodingservice.getYahooCoordinates(dto.dropOff_address);

    if (!pickupCoordinates || !dropOffCoordinates) {
        throw new NotAcceptableException('cordeinates not found');
    }

    const distance = this.distanceservice.calculateDistance(pickupCoordinates, dropOffCoordinates);
    const roundDistance = Math.round(distance);
    const flatRate = roundDistance * 4.25;

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
    order.house_apartment_number_of_dropoff = dto.house_apartment_number_of_dropoff;
    order.Area_of_dropoff = dto.Area_of_dropoff;
    order.landmark_of_dropoff = dto.landmark_of_dropoff;

    order.vehicleType = dto.vehicleType;
    order.delivery_type = dto.delivery_type;
    order.schedule_date = dto.schedule_date;

    order.pickupLat = pickupCoordinates.lat;
    order.pickupLong = pickupCoordinates.lon;
    order.dropOffLat = dropOffCoordinates.lat;
    order.dropOffLong = dropOffCoordinates.lon;
    order.distance = roundDistance;

    order.initial_cost = flatRate;
    order.bidStatus = BidStatus.PENDING;
    order.vehicleType = dto.vehicleType;
    order.payment_status = PaymentStatus.PENDING;
    order.order_status = OrderStatus.BIDDING_ONGOING;
    order.orderCreatedAtTime = new Date();

    await this.orderRepo.save(order);

    return order;
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

        this.BidEvents.emitBidEvent(BidEvent.ACCEPTED,{bidID,orderID})
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

        this.BidEvents.emitBidEvent(BidEvent.DECLINED,{bidID,orderID})
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
  async CounterBid(dto:counterBidDto, customerID:string, bidID:number):Promise<IBids>{
    try {
      const customer = await this.customerRepo.findOne({
        where: { id: customerID },
      });
  
      //check customer
      if (!customer)
        throw new NotAcceptableException(
          `customer with id ${customerID} not found`,
        );
  
      
        //check bid
        const bid = await this.bidRepo.findOne({ where: { id: bidID }, relations:['order','customer'] });
      if (!bid)
        throw new NotFoundException(
          `the bid with the ID ${bidID} does not exist`,
        );
  
  
       // Check if order already has a counter offer (enforces one-time counter)
    if (bid.bidStatus === BidStatus.COUNTERED) {
      throw new NotAcceptableException('Counter offer can only be made once for this order');
    }
  
      //counter the bid 
      bid.counter_bid_offer = dto.counter_bid
      bid.counteredAt = new Date()
      bid.bidStatus = BidStatus.COUNTERED

      this.BidEvents.emitBidEvent(BidEvent.COUNTERED,{customerID,bidID})
  
      await this.bidRepo.save(bid)
  
      //update ordertable 
  
      return bid
  
        
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('something went wrong during counter offer, please try again later ')
      
    }

  }


  // after bid is being finalized make payment and confirm payment the response will be a payment success and a tracking number for

  async  processPayment(orderID: number): Promise<PaymentResponse> {
    try {
      const order = await this.orderRepo.findOne({ where: { id: orderID },relations: ['customer','bid'],  });
      if (!order)
        throw new NotFoundException(
          `the order with the ID ${orderID} does not exist`,
        );


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
          currency:'NGN'
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
            'Content-Type': 'application/json',
          },
        },
      );
  
      if (response.data.status === true) {
        console.log('payment successful')
       
      } else {
        throw new InternalServerErrorException('Payment initialization failed. Please try again later');
      }

      return response.data
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
  
 

  // track order
}
