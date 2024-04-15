import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { RiderEntity } from "src/Entity/riders.entity";
import { RidersRepository } from "./riders.repository";
import { NotificationRepository, OtpRepository } from "src/common/common.repositories";
import { UserOtp } from "src/Entity/otp.entity";
import { Notifications } from "src/Entity/notifications.entity";
import { IRider } from "./riders";
import { ConfigService } from "@nestjs/config";
import { Logindto } from "src/common/common.dto";
import { CustomerAuthService } from "src/customer/customer.auth.service";
import { NotificationType } from "src/Enums/all-enums";

@Injectable()
export class RiderAuthService {
    constructor(
    private jwt:JwtService,
    private configservice: ConfigService,
    private customerauthservice: CustomerAuthService,
    @InjectRepository(RiderEntity)private readonly riderrepo: RidersRepository,
    @InjectRepository(UserOtp)private readonly otprepo: OtpRepository,
    @InjectRepository(Notifications)private readonly notificationrepo: NotificationRepository){}

     // get rider profile 
     async getProfile(riderId: string): Promise<IRider> {
        const rider = await this.riderrepo.findOne({where:{id:riderId}});
        if (!rider) {
          throw new NotFoundException('Rider not found');
        }
        return rider;
      }


             //login rider
      
        async login(logindto: Logindto) {
            const findrider = await this.riderrepo.findOne({
              where: { email: logindto.email },
            });
            if (!findrider)
              throw new NotFoundException('invalid login credential')
            const comparepass = await this.customerauthservice.comaprePassword(
              logindto.password,
              findrider.password,
            );
            if (!comparepass) {
              findrider.loginCount += 1;
        
              if (findrider.loginCount >= 5) {
                findrider.isLocked = true;
                findrider.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000); //lock for 24 hours
                await this.riderrepo.save(findrider);
                throw new HttpException(`invalid password`, HttpStatus.UNAUTHORIZED);
              }
        
              //  If the customer hasn't reached the maximum login attempts, calculate the number of attempts left
              const attemptsleft = 5 - findrider.loginCount;
              await this.riderrepo.save(findrider);
        
              throw new UnauthorizedException(
                `invalid credentials ${attemptsleft} attempts left before your account is locked.`,
            
              );
            }
        
            if (!findrider.isVerified) {
              // If the account is not verified, throw an exception
              throw new ForbiddenException(
                `Your account has not been verified. Please verify your account by sending a rewuest to the admin.`,
              );
            }
        
            //If the password matches, reset the login_count and unlock the account if needed
            findrider.loginCount = 0;
            findrider.isLoggedIn = true;
            await this.riderrepo.save(findrider);
        
            //save the notification
            const notification = new Notifications();
            notification.account = findrider.firstname;
            notification.subject = 'Photographer just logged in!';
            notification.notification_type = NotificationType.LOGGED_IN;
            notification.message = `Hello ${findrider.firstname}, just logged in `;
            await this.notificationrepo.save(notification);
        
            return await this.customerauthservice.signToken(findrider.id, findrider.email, findrider.role);
          }
}