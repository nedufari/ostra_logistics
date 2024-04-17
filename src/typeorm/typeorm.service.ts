import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { AdminEntity } from "src/Entity/admins.entity";
import { BidEntity } from "src/Entity/bids.entity";
import { CardEntity } from "src/Entity/card.entity";
import { CustomerEntity } from "src/Entity/customers.entity";
import { Notifications } from "src/Entity/notifications.entity";
import { OrderEntity } from "src/Entity/orders.entity";
import { UserOtp } from "src/Entity/otp.entity";
import { RiderEntity } from "src/Entity/riders.entity";

@Injectable()
export class TypeOrmService {
    constructor(private configservice: ConfigService) {}
  
    //configure the typeorm service here
    createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
      return {
        type: 'postgres',
        host: this.configservice.get('DATABASE_HOST'),
        port: this.configservice.get('DATABASE_PORT'),
        username: this.configservice.get('DATABASE_USERNAME'),
        password: String(this.configservice.get('DATABASE_PASSWORD')),
        database: this.configservice.get('DATABASE_NAME'),
        synchronize: true,
        logging: false,
        entities: [ AdminEntity, UserOtp, Notifications, CustomerEntity, OrderEntity,RiderEntity,BidEntity,CardEntity
          
        ],
        migrations: [],
        subscribers: [],
        
        
      };
      
    }
  }
  