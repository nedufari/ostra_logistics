import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notifications } from "src/Entity/notifications.entity";
import { RiderEntity } from "src/Entity/riders.entity";
import { RiderAuthController } from "./riders.auth.controller";
import { RiderAuthService } from "./riders.auth.service";
import { UserOtp } from "src/Entity/otp.entity";
import { CustomerAuthService } from "src/customer/customer.auth.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { CustomerEntity } from "src/Entity/customers.entity";
import { Mailer } from "src/common/mailer/mailer.service";

@Module({
    imports:[TypeOrmModule.forFeature([RiderEntity,Notifications,UserOtp,CustomerEntity])],
    providers:[RiderAuthService,CustomerAuthService,JwtService,ConfigService,Mailer],
    controllers:[RiderAuthController]

})
export class RiderModule{}