import { Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AdminStaffDasboardService } from "./admin.staff.dashboard.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { RegisterOtherAdminByAdminDto, UpdateOtherAdminInfoByAdminDto } from "./admin.dto";
import { ICreateAdmins } from "./admin";
import { AdminEntity } from "src/Entity/admins.entity";
import { IChangeRiderPassword } from "src/Riders/riders";
import { JwtGuard } from "src/auth/guard/jwt.guard";

@UseGuards(JwtGuard)
@Controller('admin-staff-dashboard')
export class AdminStaffDashBoardController{
    constructor(private readonly adminstaffservice:AdminStaffDasboardService){}


    @Post('/regster/')
    async AdminRegisterStaff(dto:RegisterOtherAdminByAdminDto,){
        return await this.adminstaffservice.RegisterStaff(dto)

        
    }

    @Patch('/update-staff-info/:adminId/:staffId')
    async UpdateRiderInfo(@Param('staffId')staffId:string,@Body()dto:UpdateOtherAdminInfoByAdminDto){
        return await this.adminstaffservice.UpdateStaffInfoByAdmin(staffId,dto)
    }

    @Delete('delete-staff/:staffId')
    async DeleteRider(@Param('riderID') riderID:string) {
        return await this.adminstaffservice.AdminDeleteStaff(riderID)
    }

    @Patch('/change-staff-password/:staffID')
    async ChangeRiderPassword( @Param('staffID')staffID:string) {
        return await this.adminstaffservice.AdminChangeStaffPassword(staffID)
    }

    @Get('/all-riders')
    async GetAllRiders(@Query('page')page:number, @Query('limit')limit:number){
        return await this.adminstaffservice.GetAllStaffs(page, limit);
        
    }

    @Get('/one-rider/:staffID')
    async GetOneRider(staffID:string) {
        return await this.adminstaffservice.GetOneStaffByID(staffID)
    }

    @Get('/search-riders')
    async SearchRider(@Query('keyword')keyword:string|any){
        return await this.adminstaffservice.SearchForStaff(keyword)
    }

}