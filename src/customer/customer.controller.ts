import { Body, Controller, Param, Patch, Post } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { BidActionDto, OrderDto, counterBidDto } from "src/common/common.dto";

@Controller('customer-action')
export class CustomerController{
    constructor(private readonly customerservice:CustomerService){}
    
    @Post('make-order/:customerID')
    async MakeOrder(@Param('customerID')customerID:string, @Body()dto:OrderDto){
        return await this.customerservice.PlaceOrder(customerID,dto)
    }

    @Post('accept-decline-bid/:orderID/:bidID/:customerID')
    async AcceptOrDeclineBid(@Body()dto:BidActionDto,@Param("orderID")orderId:number,@Param('customerID')customerID:string,@Param('bidID')bidID:number){
        return await this.customerservice.AcceptORDeclineBid(dto,orderId,customerID,bidID)
     }

     @Patch('counter-bid')
     async CounterBid(@Body()dto:counterBidDto,@Param("orderID")orderId:number,@Param('customerID')customerID:string,@Param('bidID')bidID:number){
        return await  this.customerservice.CounterBid(dto,orderId,customerID,bidID)
     }

     




}