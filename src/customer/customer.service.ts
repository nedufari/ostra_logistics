import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/Entity/customers.entity';
import { OrderEntity } from 'src/Entity/orders.entity';
import { OrderRepository } from 'src/order/order.reposiroty';
import { CardRepository, CustomerRepository } from './customer.repository';
import { DistanceService } from 'src/common/services/distance.service';
import { GeoCodingService } from 'src/common/services/goecoding.service';
import { BidActionDto, OrderDto, counterBidDto } from 'src/common/common.dto';
import {
  BidEvent,
  BidStatus,
  BiddingAction,
  OrderStatus,
  PaymentStatus,
} from 'src/Enums/all-enums';
import { BidEntity, IBids } from 'src/Entity/bids.entity';
import { BidRepository } from 'src/common/common.repositories';
import axios from 'axios';
import * as nanoid from 'nanoid';
import { BidEventsService } from 'src/common/Events/bid.events.service';
import { IOrder } from 'src/order/order';
import { ILike } from 'typeorm';
import { find } from 'rxjs';
import { CardDetailsDto, ChangePasswordDto, UpdateCustomerDto, addPasswordDto } from './customer.dto';
import { CardEntity, ICard } from 'src/Entity/card.entity';
import { ICustomer } from './customer';
import { CustomerAuthService } from './customer.auth.service';
import { UploadService } from 'src/common/helpers/upload.service';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: CustomerRepository,
    @InjectRepository(BidEntity)
    private readonly bidRepo: BidRepository,
    @InjectRepository(CardEntity)
    private readonly cardRepo: CardRepository,
    private distanceservice: DistanceService,
    private geocodingservice: GeoCodingService,
    private BidEvents: BidEventsService,
    private customerauthservice:CustomerAuthService,
    private uploadservice: UploadService,
  ) {}

  public generateBidGroupID(): string {
    const gen = nanoid.customAlphabet('1234567890', 3);
    return gen();
  }

  async PlaceOrder(customer: CustomerEntity, dto: OrderDto | OrderDto[]) {
    try {
      const bidGroupID = this.generateBidGroupID();

     
      if (Array.isArray(dto)) {
        const existingOrders = await this.orderRepo.find({
          where: {
            customer: customer,
            order_status: OrderStatus.BIDDING_ONGOING,
          },
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
      console.log(error);
      throw new InternalServerErrorException(
        'something went wronng while placing order, please try again',
      );
    }
  }

  private async createOrder(
    customer: CustomerEntity,
    dto: OrderDto,
  ): Promise<OrderEntity> {
    const pickupCoordinates = await this.geocodingservice.getYahooCoordinates(
      dto.pickup_address,
    );
    const dropOffCoordinates = await this.geocodingservice.getYahooCoordinates(
      dto.dropOff_address,
    );

    if (!pickupCoordinates || !dropOffCoordinates) {
      throw new NotAcceptableException('cordeinates not found');
    }

    const distance = this.distanceservice.calculateDistance(
      pickupCoordinates,
      dropOffCoordinates,
    );
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
    order.house_apartment_number_of_dropoff =
      dto.house_apartment_number_of_dropoff;
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
    customer:CustomerEntity,
    bidID: number,
  ): Promise<IBids> {
    try {
      
      //check the order
      const order = await this.orderRepo.findOne({
        where: { id: orderID },
        relations: ['customer'],
      });
      console.log('order', order);
      if (!order)
        throw new NotFoundException(
          `the order with the ID ${orderID} does not exist`,
        );

      //check bid
      const bid = await this.bidRepo.findOne({ where: { id: bidID } });
      console.log('bid', bid);
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

      if (dto && dto.action === BiddingAction.ACCEPT) {
        this.BidEvents.emitBidEvent(BidEvent.ACCEPTED, { bidID, orderID });
        //update the order table
        order.bidStatus = BidStatus.ACCEPTED;
        order.accepted_cost_of_delivery = bid.bid_value;
        await this.orderRepo.save(order);

        //update the bid entity
        bid.bidStatus = BidStatus.ACCEPTED;
        bid.order = order;
        bid.BidAcceptedAt = new Date();
        await this.bidRepo.save(bid);

        //notification for accepted bid
      } else if (dto && dto.action === BiddingAction.DECLINE) {
        this.BidEvents.emitBidEvent(BidEvent.DECLINED, { bidID, orderID });
        //update the order table
        order.bidStatus = BidStatus.DECLINED;
        await this.orderRepo.save(order);

        //update the bid entity
        bid.bidStatus = BidStatus.DECLINED;
        bid.order = order;
        bid.BidDeclinedAt = new Date();
        await this.bidRepo.save(bid);

        //notification for declined bid
      }
      return bid;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong while trying to accept or decline bid, please try again',
      );
    }
  }

  //2. counterbid with an offer
  async CounterBid(
    dto: counterBidDto,
    bidID: number,
  ): Promise<IBids> {
    try {
      
      //check bid
      const bid = await this.bidRepo.findOne({
        where: { id: bidID ,},
        relations: ['order', 'customer'],
      });
      if (!bid)
        throw new NotFoundException(
          `the bid with the ID ${bidID} does not exist`,
        );

      // Check if order already has a counter offer (enforces one-time counter)
      if (bid.bidStatus === BidStatus.COUNTERED) {
        throw new NotAcceptableException(
          'Counter offer can only be made once for this order',
        );
      }

      //counter the bid
      bid.counter_bid_offer = dto.counter_bid;
      bid.counteredAt = new Date();
      bid.bidStatus = BidStatus.COUNTERED;

      this.BidEvents.emitBidEvent(BidEvent.COUNTERED, { bid, bidID });

      await this.bidRepo.save(bid);

      //update ordertable

      return bid;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong during counter offer, please try again later ',
      );
    }
  }

  // after bid is being finalized make payment and confirm payment the response will be a payment success and a tracking number for

  async processPayment(orderID: number): Promise<PaymentResponse> {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderID },
        relations: ['customer', 'bid'],
      });
      if (!order)
        throw new NotFoundException(
          `the order with the ID ${orderID} does not exist`,
        );

      // Check if order is ready for payment (bid accepted)
      if (order.bidStatus !== BidStatus.ACCEPTED) {
        throw new NotAcceptableException(
          'Order cannot be paid for. Bid is not yet accepted',
        );
      }

      // Paystack payment integration
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount: order.accepted_cost_of_delivery * 100, // Convert to kobo (Paystack currency)
          email: order.customer.email, // Customer email for reference
          reference: order.id.toString(), // Order ID as payment reference
          currency: 'NGN',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status === true) {
        console.log('payment successful');
      } else {
        throw new InternalServerErrorException(
          'Payment initialization failed. Please try again later',
        );
      }

      return response.data;
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
  async TrackOrder(keyword: string | any): Promise<IOrder> {
    try {
      
      //find order
      const trackorder = await this.orderRepo.findOne({
        where: { trackingID: ILike(`%${keyword}`) },
        relations:['customer','bid'],
        cache:false,
        comment:"tracking order with the trackingToken generated by the system"
      });
      if (!trackorder)
        throw new NotFoundException(
          `oops! this trackingID ${keyword} is not associated with any order in ostra logistics`,
        );

      return trackorder;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something happened while trying to track your order, please try again, later',
      );
    }
  }


  //fetching all orders intransit
  async fetchallOngoingOrders(customer:CustomerEntity){
  try {
      const findorder = await this.orderRepo.findAndCount({
        where: { customer: {id:customer.id},order_status:OrderStatus.ENROUTE },
        relations:['customer','bid'],
        comment:'fetching orders that are in transit '
      })
  
      if (findorder[1]===0) throw new NotFoundException(' you have no order in transit ')
  
      return findorder
  
  } catch (error) {
    console.log(error)
    throw new InternalServerErrorException('something went wrong when fetchin orders in transit, please try again later')
    
  }
  }


    //fetching all orders intransit
    async fetchallPickedupOrders(customer:CustomerEntity){
      try {
        const findorder = await this.orderRepo.findAndCount({
          where: { customer: {id:customer.id},order_status:OrderStatus.PICKED_UP },
          relations:['customer','bid'],
          comment:'fetching orders that are picked up '
        })
    
        if (findorder[1]===0) throw new NotFoundException(' you have no order in transit ')
    
        return findorder
      } catch (error) {
        console.log(error)
        throw new InternalServerErrorException('something went wrong when fetching picked up orders, please try again later')
        
      }
  
    }

      //fetching all orders intransit
  async fetchalldroppedoff(customer:CustomerEntity){
    try {
      const findorder = await this.orderRepo.findAndCount({
        where: { customer: {id:customer.id},order_status:OrderStatus.DROPPED_OFF },
        relations:['customer','bid'],
        comment:'fetching orders that have been dropped off '
      })
  
      if (findorder[1]===0) throw new NotFoundException(' you have no order in transit ')
  
      return findorder
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('something went wrong when trying to fetch droppedOff orders, please try again later ')
      
    }

  }

  
  //add cards 
  async AddCards(dto:CardDetailsDto, customer:CustomerEntity):Promise<ICard>{
   try {
   
     //add new card 
     const card = new CardEntity()
     card.cardNumber = dto.cardNumber
     card.expiryMonth = dto.expiryMonth
     card.expiryYear = dto.expiryYear
     card.cvv = dto.cvv
     card.card_owner = customer
     card.addedAT = new Date()
     
     await this.cardRepo.save(card)
 
     return card
   } catch (error) {
    console.log(error)
    throw new InternalServerErrorException('somthing went wrong when trying to add a card,please try again later')
    
   }

  }

  //get all card 


  async getAllCardsByCustomer(customer: CustomerEntity): Promise<CardEntity[]> {
    try {
      const cards = await this.cardRepo.find({
        where: { card_owner: {id:customer.id} },
        relations: ['card_owner'], // Ensure that the relation is correctly set in your CardEntity
        comment: 'Fetch all cards related to this user',
      });

      if (!cards || cards.length === 0) {
        throw new NotFoundException('You have no cards stored yet');
      }

      return cards;
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException('Something went wrong when trying to fetch all your cards. Please try again later.');
      }
    }
  }

  //get one card 

  async GetOneCard(customer:CustomerEntity, cardID:number){
    try {
      const findcard = await this.cardRepo.findOne({
        where: { card_owner: {id:customer.id}, id:cardID },
        relations:['card_owner'],
        comment:'fetching one card related to this user '
      })
  
      if (!findcard) throw new NotFoundException(` there is no card associated wit the cardID: ${cardID} `)
  
      return findcard
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('something went wrong when trying to fetch the details of one card, please try again later')
      
    }

  }

  //delete one card 

  async DeleteOneCard(customer:CustomerEntity, cardID:number){
    try {
      const findcard = await this.cardRepo.findOne({
        where: { card_owner: {id:customer.id}, id:cardID }, 
        relations:['card_owner'],
        comment:'fetching one card and then deleting it '
      })
  
      if (!findcard) throw new NotFoundException(` there is no card associated wit the cardID: ${cardID} `)
  
      //delete card 
      await this.cardRepo.remove(findcard)
  
      return {message:"card successfully deleted"}
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('something went wrong while trying to delete a card, please try again later')
      
    }

  }


  //customer profile 

  //update info for onboarding and for profile 
  async UpdateCustomerInfo(dto:UpdateCustomerDto,customer:CustomerEntity):Promise<{message:string}>{
    try {

       // Check if the provided email is already in use
       const existingCustomer = await this.customerRepo.findOne({where:{email:dto.email}});
       if (existingCustomer && existingCustomer.id !== customer.id) {
         throw new ConflictException('Email is already in use');
       }
      
      //add the updated data from the dto 
     
      customer.LGA_of_Home_Address = dto.LGA_of_Home_Address
      customer.RegisteredAt = new Date()
      customer.email = dto.email
      customer.home_address = dto.home_address
      customer.firstname = dto.firstname
      customer.lastname = dto.lastname
      customer.gender = dto.gender
  
      await this.customerRepo.save(customer)
      return {message:"changes to record made successfully"}
      
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('something went wrong while updating the user info, please try again later')
      
    }
  }

  // change password 
  async changeCustomerPassword(dto:ChangePasswordDto,customer:CustomerEntity):Promise<{message:string}>{

    const { oldPassword, password, confirmPassword } = dto;

    const comparepass = await this.customerauthservice.comaprePassword(
      dto.oldPassword,
      customer.password,
    );
    if (!comparepass) throw new NotAcceptableException('the old password provided does not match the existing passworod')

    const hashpass = await this.customerauthservice.hashpassword(dto.password)

    
    customer.password = hashpass
    try {
       await this.customerRepo.save(customer)
       return {message:'passwod chanaged successfully'}
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('something happened when trying to change password, please try again later')
      
    }


  }

  //upload profile pics 

  async UploadCustomerProfilePics(
    mediafile: Express.Multer.File,customer:CustomerEntity):Promise<{message:string}>{
      try {
        const display_pics = await this.uploadservice.uploadFile(mediafile);
        const mediaurl = `http://localhost:3000/api/v1/ostra-logistics_api/uploadfile/public/${display_pics}`;
  
        //update the image url 
  
        customer.profile_picture = mediaurl
  
        await this.customerRepo.save(customer)
  
        return {message:'your profile picture has been uploaded successully '}
  
      } catch (error) {
        console.log(error)
        throw new InternalServerErrorException('something went wrong during profile picture upload')
        
      }

  

    }








 
}
