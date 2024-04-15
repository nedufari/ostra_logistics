import { Controller, UploadedFile, UseInterceptors, Post,Get,Patch,Delete, BadRequestException, Query, InternalServerErrorException, Body, Param } from "@nestjs/common";
import { AdminRiderDashboardService } from "./admin.riders.dashboard.service";
import { RegisterRiderByAdminDto, UpdateRiderInfoByAdminDto } from "./admin.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { IChangeRiderPassword, IRegisterRider } from "src/Riders/riders";
import { RiderEntity } from "src/Entity/riders.entity";

@Controller('admin-rider-dashboard')
export class AdminRiderDashBoardController{
    constructor(private readonly adminriderservice:AdminRiderDashboardService){}


    @Post('/register/:adminId')
    @UseInterceptors(FileInterceptor('profile_picture'))
    async AdminRegisterRider(@Param('adminId')adminId:string,@Body()dto:RegisterRiderByAdminDto,@UploadedFile()file:Express.Multer.File):Promise<{message: string; response: IRegisterRider}>{
        return await this.adminriderservice.RegisterRider(adminId,dto,file)

        
    }

    @Patch('/update-rider-info/:adminId/:riderId')
    async UpdateRiderInfo(@Param('adminId')adminId:string,@Param('riderId')riderId:string,@Body()dto:UpdateRiderInfoByAdminDto,@UploadedFile()file:Express.Multer.File):Promise<{message: string; response: IRegisterRider}>{
        return await this.adminriderservice.UpdateRiderInfoByAdmin(adminId,riderId,dto,file)
    }

    @Delete('delete-rider/:adminID/:riderID')
    async DeleteRider(@Param('adminID')adminID:string, @Param('riderID')riderID:string): Promise<{ message: string | BadRequestException }> {
        return await this.adminriderservice.AdminDeleteRider(adminID,riderID)
    }

    @Patch('/change-rider-password/:adminID/:riderID')
    async ChangeRiderPassword(@Param('adminID')adminID:string, @Param('riderID')riderID:string):Promise<{ message: string; response: IChangeRiderPassword }> {
        return await this.adminriderservice.AdminChangeRiderPassword(adminID,riderID)
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


}