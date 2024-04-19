import { InjectRepository } from "@nestjs/typeorm";
import { AdminEntity } from "src/Entity/admins.entity";
import { AdminRepository } from "./admin.repository";
import { CustomerEntity } from "src/Entity/customers.entity";
import { CustomerRepository } from "src/customer/customer.repository";
import { BidRepository } from "src/common/common.repositories";
import { BidEntity, IBids, IInitialBidsResponse } from "src/Entity/bids.entity";
import { IOrder, IOrderRequestFromCustomerToAdmin } from "src/order/order";
import { OrderRepository } from "src/order/order.reposiroty";
import { OrderEntity } from "src/Entity/orders.entity";
import { BidEvent, BidStatus, OrderStatus } from "src/Enums/all-enums";
import { Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { AdminPlaceBidDto, counterBidDto } from "src/common/common.dto";
import { BidEventsService } from "src/common/Events/bid.events.service";

@Injectable()
export class AdminCustomerDashBoardService{
    constructor(
        @InjectRepository(AdminEntity) private readonly adminrepo: AdminRepository,
        @InjectRepository(CustomerEntity) private readonly customerRepo: CustomerRepository,
        @InjectRepository(OrderEntity) private readonly orderRepo: OrderRepository,
        @InjectRepository(BidEntity)private readonly bidRepo: BidRepository,
        private readonly  bidevent :BidEventsService

    ){}

    //query orders 

    async GetOrdersThatArePending(page:number =1, limit:number = 20):Promise<{response:IOrderRequestFromCustomerToAdmin[], total:number}>{
       try {
         const skip = (page -1)*limit
         
        const [orders,  total] = await this.orderRepo.findAndCount({
         where:{
             order_status:OrderStatus.BIDDING_ONGOING},
             relations: ['bid','Rider','customer'], // Assuming relations are correctly defined
         order: { orderCreatedAtTime: 'DESC' },
         take: limit,
         skip: skip,
         })
 
         const response: IOrderRequestFromCustomerToAdmin[] =orders.map(order =>({
             id:order.id,
             parcel_name:order.parcel_name,
             quantity:order.quantity,
             parcelWorth:order.parcelWorth,
             weight_of_parcel:order.weight_of_parcel,
             describe_weight_of_parcel:order.describe_weight_of_parcel,
             product_category:order.product_category,
             pickup_address:order.pickup_address,
             pickup_phone_number:order.pickup_phone_number,
             house_apartment_number_of_pickup:order.house_apartment_number_of_pickup,
             Area_of_pickup:order.Area_of_pickup,
             landmark_of_pickup:order.landmark_of_pickup,
             note_for_rider:order.note_for_rider,
 
             Recipient_name:order.Recipient_name,
             Recipient_phone_number:order.Recipient_phone_number,
             dropOff_address:order.dropOff_address,
             house_apartment_number_of_dropoff:order.house_apartment_number_of_dropoff,
             Area_of_dropoff:order.Area_of_dropoff,
             landmark_of_dropoff:order.Area_of_dropoff,
 
             vehicleType:order.vehicleType,
             delivery_type:order.delivery_type,
             schedule_date:order.schedule_date,
             initial_cost:order.initial_cost,
             customer:order.customer,

             Rider:order.Rider
             
         }))
 
         return {response:response, total}
       } catch (error) {
        console.log(error)
        throw new InternalServerErrorException('error fetching orders')
        
       }
    }

     

    //make openning bid based on influenced matrix cost calculations

    async MakeOpenningBid( orderID:number,dto:AdminPlaceBidDto):Promise<IInitialBidsResponse>{
     

      const order = await this.orderRepo.findOne({where:{id:orderID},relations:['bid']})
      if (!order) throw new NotFoundException(`order with the id: ${orderID} is not found`)

      // new bid 
      const bid = new BidEntity()
      bid.order = order
      bid.bid_value = dto.bid
      bid.initialBidPlacedAt = new Date()
      bid.bidStatus = BidStatus.BID_PLACED

      //this.bidevent.emitBidEvent(BidEvent.BID_INITIATED,{admin,orderID})

      await this.bidRepo.save(bid)

      const bidresponse:IInitialBidsResponse ={
        id:bid.id,
        bid_value : bid.bid_value,
        bidStatus : bid.bidStatus,
        initialBidPlacedAt :bid.initialBidPlacedAt,
        order: bid.order
      }
      return bidresponse
    

    }

    //counter bids sent in 

    async counterCustomerCouterBid( bidID:number, dto:counterBidDto):Promise<IBids>{
    
        //check if order is related to the countered bid 
        const bid = await this.bidRepo.findOne({where:{id:bidID},relations:['order','customer']})
        if (!bid) throw new NotFoundException('this bis isnt found')

        //check if the bid has been countered first before sending in a counter bid
        if (bid && bid.bidStatus !== BidStatus.COUNTERED) throw new NotAcceptableException('these bid has not been countered so you cannot counter this bid')

        //finally counter the bid and set a new counter bid 
        bid.counter_bid_offer = dto.counter_bid
        bid.bidStatus = BidStatus.COUNTERED
        bid.counteredAt = new Date()
        await this.bidRepo.save(bid)

        //this.bidevent.emitBidEvent(BidEvent.COUNTERED,{adminID,bidID})

        return bid



    }














    //fetch all customers 

    //guery customers 
    //get others that are enroute

    //get orders that are delivered 

    //track orders

    // and so on....
}