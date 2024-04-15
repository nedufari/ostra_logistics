import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { AdminStaffDasboardService } from "./admin.staff.dashboard.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { RegisterOtherAdminByAdminDto, UpdateOtherAdminInfoByAdminDto } from "./admin.dto";
import { ICreateAdmins } from "./admin";
import { AdminEntity } from "src/Entity/admins.entity";
import { IChangeRiderPassword } from "src/Riders/riders";

@Controller('admin-staff-dashboard')
export class AdminStaffDashBoardController{
    constructor(private readonly adminstaffservice:AdminStaffDasboardService){}


    @Post('/regster/:adminId')
    @UseInterceptors(FileInterceptor('media'))
    async AdminRegisterStaff(@Param('adminId')adminId:string,dto:RegisterOtherAdminByAdminDto,@UploadedFile()file:Express.Multer.File):Promise<{message: string; response: ICreateAdmins}>{
        return await this.adminstaffservice.RegisterStaff(adminId,dto,file)

        
    }

    @Patch('/update-staff-info/:adminId/:staffId')
    async UpdateRiderInfo(@Param('adminId')adminId:string,@Param('staffId')staffId:string,@Body()dto:UpdateOtherAdminInfoByAdminDto,@UploadedFile()file:Express.Multer.File):Promise<{message: string; response: ICreateAdmins}>{
        return await this.adminstaffservice.UpdateStaffInfoByAdmin(adminId,staffId,dto,file)
    }

    @Delete('delete-staff/:adminID/:staffId')
    async DeleteRider(adminID:string, riderID:string): Promise<{ message: string | InternalServerErrorException }> {
        return await this.adminstaffservice.AdminDeleteStaff(adminID,riderID)
    }

    @Patch('/change-rider-password/:adminID/:staffID')
    async ChangeRiderPassword(@Param('adminID')adminID:string, @Param('staffID')staffID:string):Promise<{ message: string; response: IChangeRiderPassword }> {
        return await this.adminstaffservice.AdminChangeStaffPassword(adminID,staffID)
    }

    @Get('/all-riders')
    async GetAllRiders(@Query('page')page:number, @Query('limit')limit:number):Promise<AdminEntity[] | InternalServerErrorException>{
        return await this.adminstaffservice.GetAllStaffs(page, limit);
        
    }

    @Get('/one-rider/:staffID')
    async GetOneRider(staffID:string): Promise<AdminEntity | InternalServerErrorException> {
        return await this.adminstaffservice.GetOneStaffByID(staffID)
    }

    @Get('/search-riders')
    async SearchRider(@Query('keyword')keyword:string|any){
        return await this.adminstaffservice.SearchForStaff(keyword)
    }

}