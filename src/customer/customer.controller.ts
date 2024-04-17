import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { BidActionDto, OrderDto, counterBidDto } from "src/common/common.dto";
import { Request } from "express";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { CardDetailsDto, ChangePasswordDto, UpdateCustomerDto } from "./customer.dto";
import { CustomerEntity } from "src/Entity/customers.entity";
import { FileInterceptor } from "@nestjs/platform-express";

@UseGuards(JwtGuard)
@Controller('customer-action')
export class CustomerController{
    constructor(private readonly customerservice:CustomerService){}
    
    @Post('make-order')
    async MakeOrder(@Req()req, @Body()dto:OrderDto | OrderDto[]){
        return await this.customerservice.PlaceOrder(req.user,dto)
    }

    @Post('accept-decline-bid/:orderID/:bidID')
    async AcceptOrDeclineBid(@Body()dto:BidActionDto,@Param("orderID")orderId:number,@Req()req,@Param('bidID')bidID:number){
        return await this.customerservice.AcceptORDeclineBid(dto,orderId,req.user,bidID)
     }

     @Patch('counter-bid/:bidID')
     async CounterBid(@Body()dto:counterBidDto,@Param('bidID')bidID:number){
        return await  this.customerservice.CounterBid(dto,bidID)
     }

     @Post('process-payment/:orderID')
     async PayWithPaystackForTheOrder(@Param('orderID')orderID:number){
        return await this.customerservice.processPayment(orderID)
     }

     @Get('track-order/')
     async TrackOrder(@Query('keyword')keyword:string|any){
      await this.customerservice.TrackOrder(keyword)
     }

     @Get('in-transit')
     async GetallOrdersinTransit(@Req()req){
      return await this.customerservice.fetchallOngoingOrders(req.user)
     }

     @Get('pickedup-orders')
     async GetallOrdersPickup(@Req()req){
      return await this.customerservice.fetchallPickedupOrders(req.user)
     }

     @Get('droppedOff-orders')
     async GetallOrdersdroppedOff(@Req()req){
      return await this.customerservice.fetchalldroppedoff(req.user)
     }

     //debit card 

     @Post('add-card')
     async AddCard(@Body()dto:CardDetailsDto, @Req()req){
      return await this.customerservice.AddCards(dto,req.user)
     }

     @Get('all-my-cards')
     async GetAllMyCard(@Req()req){
      console.log(req.user)
      return await this.customerservice.getAllCardsByCustomer(req.user)
     }


     @Get('one-card/:cardID')
     async GetOneCard(@Req()req, @Param('cardID')cardID:number){
      return await this.customerservice.GetOneCard(req.user,cardID)
     }

     @Delete('delete-card/:cardID')
     async DeleteOneCard(@Req()req, @Param('cardID')cardID:number){
      return await this.customerservice.DeleteOneCard(req.user,cardID)
     }

     //user profile 

     @Patch('update-customer-info')
     async UpdateCustomerInfo(@Body()dto:UpdateCustomerDto,@Req()req){
      return await this.customerservice.UpdateCustomerInfo(dto,req.user)
     }


     @Patch('change-password')
     async ChangePassword(@Body()dto:ChangePasswordDto,@Req()req){
      return await this.customerservice.changeCustomerPassword(dto,req.user)
     }

     @Patch('upload-profile-pics')
     @UseInterceptors(FileInterceptor('image'))
     async UploadProfilePics (@UploadedFile()file:Express.Multer.File,@Req()req){
      return await this.customerservice.UploadCustomerProfilePics(file,req.user)
     }








     




}