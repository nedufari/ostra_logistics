import { Body, Controller, Post,UseGuards,Get,Req } from "@nestjs/common";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { Logindto } from "src/common/common.dto";
import { RiderAuthService } from "./riders.auth.service";

@Controller('rider-auth')
export class RiderAuthController{
    customerauthservice: any;
    constructor(private readonly riderauthsrvice:RiderAuthService){}

    @UseGuards(JwtGuard)
    @Get('profile')
    async getProfile(@Req() req: any): Promise<any> {
      const riderId = req.user.id;
      return this.customerauthservice.getProfile(riderId);
    }

    @Post('/login')
    async Login(@Body()dto:Logindto){
        return await this.riderauthsrvice.login(dto)
    }
}