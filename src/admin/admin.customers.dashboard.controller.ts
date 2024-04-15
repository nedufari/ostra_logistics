import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AdminCustomerDashBoardService } from "./admin.customers.dashboard.service";
import { AdminPlaceBidDto } from "src/common/common.dto";

@Controller('admin-customer-dashboard')
export class AdminCustomerDashBoardController{
    constructor(private readonly admincustomerservice:AdminCustomerDashBoardService){}

    @Get('pending-orders')
    async GetAllPendingOrders(
    @Query('page') page: number,
    @Query('limit') limit: number){

        return await this.admincustomerservice.GetOrdersThatArePending(page,limit)

    }

    @Post('initial-bid/:orderID/:adminID')
    async MakeFirstBid(@Body()dto:AdminPlaceBidDto, @Param("orderID")orderID:number,@Param("adminID")adminID:string){
        return await this.admincustomerservice.MakeOpenningBid(adminID,orderID,dto)
    }
}