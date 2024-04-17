import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerEntity } from "src/Entity/customers.entity";
import { CustomerAuthService } from "./customer.auth.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserOtp } from "src/Entity/otp.entity";
import { Notifications } from "src/Entity/notifications.entity";
import { Mailer } from "src/common/mailer/mailer.service";
import { CustomerAuthController } from "./customer.auth.controller";
import { DistanceService } from "src/common/services/distance.service";
import { GeoCodingService } from "src/common/services/goecoding.service";
import { OrderEntity } from "src/Entity/orders.entity";
import { CustomerController } from "./customer.controller";
import { CustomerService } from "./customer.service";
import { BidEntity } from "src/Entity/bids.entity";
import { BidEventsService } from "src/common/Events/bid.events.service";
import { CardEntity } from "src/Entity/card.entity";
import { UploadService } from "src/common/helpers/upload.service";

@Module({
    imports:[TypeOrmModule.forFeature([CustomerEntity,UserOtp,Notifications,OrderEntity,BidEntity,CardEntity])],
    providers:[CustomerAuthService,JwtService,ConfigService,Mailer,DistanceService,GeoCodingService,CustomerService,BidEventsService,UploadService],
    controllers:[CustomerAuthController,CustomerController]
})
export class CustomerModule{}