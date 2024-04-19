import { Body, Controller, Post,UseGuards,Get,Req, Patch } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { Logindto } from "src/common/common.dto";
import { RiderAuthService } from "./riders.auth.service";
import { RequestResetPasswordDto } from "./riders.dto";

@Controller('rider-auth')
export class RiderAuthController{
    customerauthservice: any;
    constructor(private readonly riderauthsrvice:RiderAuthService){}

    @UseGuards(JwtGuard)
    @Get('profile')
    async getProfile(@Req() req): Promise<any> {
      
      return this.riderauthsrvice.getProfile(req.user);
    }

    @Post('/login')
    async Login(@Body()dto:Logindto){
        return await this.riderauthsrvice.login(dto)
    }

    @Patch('/password-reset-request')
    async RequestResetPassword(@Body()dto:RequestResetPasswordDto){
      return await this.riderauthsrvice.RequestResetPassword(dto)
    }
}