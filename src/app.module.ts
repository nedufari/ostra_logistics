import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmService } from './typeorm/typeorm.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { CustomerModule } from './customer/customer.module';
import { RiderModule } from './Riders/riders.module';
import { AdminModule } from './admin/admin.module';
import { WebHookModule } from './Payment/webhook.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [CustomerModule,
    CommonModule,
    RiderModule,
    AdminModule,
    WebHookModule,
    AuthModule,
    
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmService }),
    MailerModule.forRoot({
      transport:{
        service:"gmail",
        host:"smtp.gmail.com",
        port:587,
        secure: true, //verify to know why false is preferble 
        auth: {
          user: process.env.AUTH_EMAIL,
          pass:process.env.AUTH_PASS
        }
      }
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
