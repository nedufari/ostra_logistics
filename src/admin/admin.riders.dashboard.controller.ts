import { Controller, UploadedFile, UseInterceptors, Post,Get,Patch,Delete, BadRequestException, Query, InternalServerErrorException, Body, Param, UseGuards } from "@nestjs/common";
import { AdminRiderDashboardService } from "./admin.riders.dashboard.service";
import { RegisterRiderByAdminDto, UpdateRiderInfoByAdminDto } from "./admin.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { IChangeRiderPassword, IRegisterRider } from "src/Riders/riders";
import { RiderEntity } from "src/Entity/riders.entity";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { Multer } from "multer";

@UseGuards(JwtGuard)
@Controller('admin-rider-dashboard')
export class AdminRiderDashBoardController{
    constructor(private readonly adminriderservice:AdminRiderDashboardService){}


    @Post('/register/:adminId')
    async AdminRegisterRider(@Param('adminId')adminId:string,@Body()dto:RegisterRiderByAdminDto):Promise<{message: string; response: IRegisterRider}>{
        return await this.adminriderservice.RegisterRider(dto) 
    }

    @Patch('/update-rider-info/:riderId')
    async UpdateRiderInfo(@Param('riderId')riderId:string,@Body()dto:UpdateRiderInfoByAdminDto):Promise<{message: string; response: IRegisterRider}>{
        return await this.adminriderservice.UpdateRiderInfoByAdmin(riderId,dto,)
    }

    @Delete('delete-rider/:riderID')
    async DeleteRider( @Param('riderID')riderID:string): Promise<{ message: string | BadRequestException }> {
        return await this.adminriderservice.AdminDeleteRider(riderID)
    }

    @Patch('/change-rider-password/:riderID')
    async ChangeRiderPassword(@Param('adminID')adminID:string, @Param('riderID')riderID:string):Promise<{ message: string; response: IChangeRiderPassword }> {
        return await this.adminriderservice.AdminChangeRiderPassword(riderID)
    }

    @Get('/all-riders')
    async GetAllRiders(@Query('page')page:number, @Query('limit')limit:number):Promise<RiderEntity[] | InternalServerErrorException>{
        return await this.adminriderservice.GetAllRiders(page, limit);
        
    }

    @Get('/one-rider/:riderID')
    async GetOneRider(@Param('riderID')riderID:string): Promise<RiderEntity | InternalServerErrorException> {
        return await this.adminriderservice.GetOneRiderByID(riderID)
    }

    @Get('/search-riders')
    async SearchRider(@Query('keyword')keyword:string|any){
        return await this.adminriderservice.SearchForRider(keyword)
    }

    @Patch('upload-profile-pics/:riderID')
    @UseInterceptors(FileInterceptor('image'))
    async UploadProfilePics(@Param('riderID')riderID:string,@UploadedFile()file:Express.Multer.File){
        return await this.adminriderservice.UploadRiderProfilePics(file,riderID)
    }

    @Patch('upload-driver-license-front/:riderID')
    @UseInterceptors(FileInterceptor('image'))
    async UploadDriverLicenseFront(@Param('riderID')riderID:string,@UploadedFile()file:Express.Multer.File){
        return await this.adminriderservice.UploadDriverLicenseFront(file,riderID)
    }

    @Patch('upload-driver-license-back/:riderID')
    @UseInterceptors(FileInterceptor('image'))
    async UploadDriverLicenseBack(@Param('riderID')riderID:string,@UploadedFile()file:Express.Multer.File){
        return await this.adminriderservice.UploadDriverLicenseBack(file,riderID)
    }

    @Get('total-number-of-rider')
    async GetTotalNumberOfRiders(){
        return await this.adminriderservice.totalnumberofriders()

    }

    @Patch('assign-order-to-rider/:orderID/:riderID')
    async AssignOrderToRide(@Param('orderID')orderID:number, @Param('riderID')riderID:string){
        return await this.adminriderservice.AssignOrderToRider(riderID,orderID)
    }


}