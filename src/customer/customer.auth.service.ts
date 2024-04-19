import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/Entity/customers.entity';
import { LessThan, Repository } from 'typeorm';
import { CustomerRepository } from './customer.repository';
import * as bcrypt from 'bcrypt';
import * as nanoid from 'nanoid';
import { customAlphabet } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ICustomer } from './customer';
import { RegisterCustomerDto, addPasswordDto } from './customer.dto';
import { NotificationType, Role } from 'src/Enums/all-enums';
import { UserOtp } from 'src/Entity/otp.entity';
import {
  NotificationRepository,
  OtpRepository,
} from 'src/common/common.repositories';
import { Notifications } from 'src/Entity/notifications.entity';
import {
  
  Logindto,
  RequestOtpResendDto,
  SendPasswordResetLinkDto,
  VerifyOtpDto,
  VerifyOtpForResetPasswordDto,
} from 'src/common/common.dto';
import { Mailer } from 'src/common/mailer/mailer.service';

@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerrepo: CustomerRepository,
    @InjectRepository(UserOtp) private readonly otprepo: OtpRepository,
    @InjectRepository(Notifications)
    private readonly notificationrepo: NotificationRepository,
    private configservice: ConfigService,
    private jwt: JwtService,
    private mailerservice: Mailer,
  ) {}

  public async hashpassword(password): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  public async comaprePassword(userpassword, dbpassword): Promise<boolean> {
    return await bcrypt.compare(userpassword, dbpassword);
  }

  public generateEmailToken(): string {
    const gen = customAlphabet('12345678990', 6);
    return gen();
  }

  //access token
  public async signToken(id: string, email: string, role: string) {
    const payload = {
      sub: id,
      email,
      role,
    };
    const secret = this.configservice.get('SECRETKEY');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.configservice.get('EXPIRESIN'),
      secret: secret,
    });
    return { token: token };
  }

  // get customer profile
  async getProfile(customer: CustomerEntity): Promise<ICustomer> {
   try {
    
     if (!customer) {
       throw new NotFoundException('Customer not found');
     }
     return customer;
   } catch (error) {
    console.log(error)
    throw new InternalServerErrorException('something happened while trying to fetch user profile')
    
   }
  }

  //sign up customer

  async RegisterCustomer(
    dto: RegisterCustomerDto,
  ): Promise<{ message: string }> {
    try {
      const checkemail = await this.customerrepo.findOne({
        where: { email: dto.email },
      });
      if (checkemail)
        throw new HttpException('This customer already exists', HttpStatus.FOUND);
  
  
      const customer = new CustomerEntity();
      customer.email = dto.email;
      customer.mobile = dto.mobile
      customer.firstname = dto.firstname;
      customer.lastname = dto.lastname;
      customer.role = Role.CUSTOMER;
      customer.RegisteredAt = new Date();
      customer.isRegistered = true;
  
      await this.customerrepo.save(customer);
  
      //2fa authentication
      const emiailverificationcode = await this.generateEmailToken();
  
      // mail
      await this.mailerservice.SendVerificationeMail(dto.email, dto.firstname);
  
      //otp
      const otp = new UserOtp();
      otp.email = dto.email;
      otp.otp = emiailverificationcode;
      otp.role = customer.role;
      const twominuteslater = new Date();
      await twominuteslater.setMinutes(twominuteslater.getMinutes() + 10);
      otp.expiration_time = twominuteslater;
      await this.otprepo.save(otp);
  
      //save the notification
      const notification = new Notifications();
      notification.account = customer.firstname;
      notification.subject = 'New Customer Created!';
      notification.notification_type = NotificationType.ADMIN_CREATED;
      notification.message = `new admin created successfully `;
      await this.notificationrepo.save(notification);
  
      return {
        message:
          'You have successfully registered as a customer, please check your email for the otp verification',
      };
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('an error occured while trying register as a customer',error)
      
    }
  }



  //add password and confirm it too 
  async AddPasswordAfterVerification(customerID:string, dto:addPasswordDto):Promise<{message:string}>{
   try {
     const checkcustomer = await this.customerrepo.findOne({where:{id:customerID}})
     if (!checkcustomer.isVerified) throw new UnauthorizedException('sorry this customer has not been verified yet, please request for an otp to verify your account')
 
     const hashedpassword = await this.hashpassword(dto.password)
 
     //add the password 
     checkcustomer.password = hashedpassword
 
     await this.customerrepo.save(checkcustomer)
 
     return {message:'password has been added successfully'}

   } catch (error) {
    throw  new InternalServerErrorException('an error occured while adding password',error)
    
   }
  }

  

  // verify email of customer
  async verifyEmail(
    dto: VerifyOtpDto,
  ): Promise<{ isValid: boolean; accessToken: any }> {
    //find the otp privided if it matches with the otp stored
    try {
      const findotp = await this.otprepo.findOne({ where: { otp: dto.otp } });
      if (!findotp)
        throw new HttpException(
          'you provided an invalid OTP,please go back to your email and confirm the OTP sent to you',
          HttpStatus.BAD_REQUEST,
        );
  
      //find if the otp is expired
      if (findotp.expiration_time <= new Date())
        throw new RequestTimeoutException(
          'OTP is expired, please request for another one',
        );
  
  
      // Find the customer associated with the OTP
      const customer = await this.customerrepo.findOne({
        where: { email: findotp.email },
      });
      if (!customer)
        throw new NotFoundException(
          'No customer found for the provided OTP.',
        );
  
      // Verify and update the customer's status
      customer.isVerified = true;
      customer.isLoggedIn = true;
      await this.customerrepo.save(customer);
  
      const notification = new Notifications();
      (notification.account = customer.firstname),
      (notification.subject = 'Customer Verified!');
      notification.notification_type = NotificationType.EMAIL_VERIFICATION;
      notification.message = `Hello ${customer.firstname}, your email has been successfully verified `;
      await this.notificationrepo.save(notification);
  
      //await this.mailerservice.SendWelcomeEmail(admin.email,admin.brandname)
  
      await this.customerrepo.save(customer);
  
      const accessToken = await this.signToken(
        customer.id,
        customer.email,
        customer.role,
      );
  
      return { isValid: true, accessToken };
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('an error occured while verifying the email of the customer ',error)
      
    }
  }

  // resend email verification otp when the one sent is expired
  async ResendExpiredOtp(
    email:string | any,
  ): Promise<{ message: string }> {
    const emailexsist = await this.customerrepo.findOne({
      where: { email: email },
    });
    if (!emailexsist)
      throw new HttpException(
        `customer with email: ${email}doesn't exists, please use an already registered email`,
        HttpStatus.CONFLICT,
      );

    // Check if there is an expired OTP for the user
    const expiredOtp = await this.otprepo.findOne({
      where: { email:email, expiration_time: LessThan(new Date()) },
    });
    if (!expiredOtp) {
      throw new NotFoundException(
        'No expired OTP found for this user.',
        
      );
    }
    // Generate a new OTP
    const emiailverificationcode = await this.generateEmailToken(); // Your OTP generated tokens

    // Save the token with expiration time
    const twominuteslater = new Date();
    await twominuteslater.setMinutes(twominuteslater.getMinutes() + 10);

    //save the token
    const newOtp = this.otprepo.create({
      email: email,
      otp: emiailverificationcode,
      expiration_time: twominuteslater,
      role: emailexsist.role,
    });
    await this.otprepo.save(newOtp);

    //save the notification
    const notification = new Notifications();
    notification.account = emailexsist.firstname;
    notification.subject = 'Otp Resent!';
    notification.notification_type = NotificationType.EMAIL_VERIFICATION;
    notification.message = `Hello ${emailexsist.firstname}, a new verification Link has been resent to your mail `;
    await this.notificationrepo.save(notification);

    //send mail
    await this.mailerservice.SendVerificationeMail(
      newOtp.email,
      emailexsist.firstname,
    );

    return { message: 'New Otp verification code has been sent successfully' };
  }



  //request for an otp to verify the user before resetting the password
  async sendPasswordResetToken(
    dto: SendPasswordResetLinkDto,
  ): Promise<{ message: string }> {
    try {
      const isEmailReistered = await this.customerrepo.findOne({
        where: { email: dto.email },
      });
      if (!isEmailReistered)
        throw new NotFoundException(
          `this email ${dto.email} does not exist in our system, please try another email address`,
          
        );
  
      const resetlink = await this.generateEmailToken();
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 1);
  
      //send reset link to the email provided
      await this.mailerservice.SendPasswordResetLinkMail(
        dto.email,
        resetlink,
        isEmailReistered.firstname,
      );
  
      //save the reset link and the expiration time to the database
      isEmailReistered.password_reset_link = resetlink;
      isEmailReistered.reset_link_exptime = expirationTime;
      await this.customerrepo.save(isEmailReistered);
  
      const notification = new Notifications();
      (notification.account = isEmailReistered.firstname),
        (notification.subject = 'password Reset link!');
      notification.notification_type = NotificationType.EMAIL_VERIFICATION;
      notification.message = `Hello ${isEmailReistered.firstname}, password resent link sent `;
      await this.notificationrepo.save(notification);
  
      return { message: 'The password reset link has been sent successfully' };
    } catch (error) {
      throw new InternalServerErrorException('an error occured while trying to request for a password rest token',error)
      
    }
  }



  //verify token sent when trying to reset password
  async VerifyResetPasswordOtp(
    dto: VerifyOtpForResetPasswordDto,
  ): Promise<{ message: string }> {

    //find the user who has the reset otp sent 
    const verifyuser = await this.customerrepo.findOne({where: { password_reset_link:dto.otp }});
    if (!verifyuser)
      throw new NotAcceptableException(
        'the reset password token is incorrect please retry or request for another token',
      );

     //find if the otp is expired
     if (verifyuser.reset_link_exptime <= new Date())
     throw new RequestTimeoutException(
       'reset token is expired, please request for another one',
     );


    const notification = new Notifications();
    (notification.account = verifyuser.firstname),
      (notification.subject = 'Verify Password Reset Token!');
    notification.notification_type = NotificationType.EMAIL_VERIFICATION;
    notification.message = `Hello ${verifyuser.firstname}, password reset link verified and the password has been recently reseted `;
    await this.customerrepo.save(verifyuser);

    return { message: 'otp has been verified' };
  }



  //reset password 
  async FinallyResetPasswordAfterVerification(customerID:string|any, dto:addPasswordDto):Promise<{message:string}>{
    try {
      const checkcustomer = await this.customerrepo.findOne({where:{id:customerID}})
      if (!checkcustomer.isVerified) throw new UnauthorizedException('sorry this customer has not been verified yet, please request for an otp to verify your account')
  
      const hashedpassword = await this.hashpassword(dto.password)
  
      //add the password 
      checkcustomer.password = hashedpassword
  
      await this.customerrepo.save(checkcustomer)
  
      return {message:'password has been reset successfully'}
 
    } catch (error) {
     throw  new InternalServerErrorException('an error occured while reseting password',error)
     
    }
   }

  //login admin

  async login(logindto: Logindto) {
    const findcustomer = await this.customerrepo.findOne({
      where: { email: logindto.email },
    });
    if (!findcustomer)
      throw new HttpException(`invalid credential`, HttpStatus.NOT_FOUND);
    const comparepass = await this.comaprePassword(
      logindto.password,
      findcustomer.password,
    );
    if (!comparepass) {
      findcustomer.loginCount += 1;

      if (findcustomer.loginCount >= 5) {
        findcustomer.isLocked = true;
        findcustomer.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000); //lock for 24 hours
        await this.customerrepo.save(findcustomer);
        throw new HttpException(`invalid password`, HttpStatus.UNAUTHORIZED);
      }

      //  If the customer hasn't reached the maximum login attempts, calculate the number of attempts left
      const attemptsleft = 5 - findcustomer.loginCount;
      await this.customerrepo.save(findcustomer);

      throw new HttpException(
        `invalid credentials ${attemptsleft} attempts left before your account is locked.`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!findcustomer.isVerified) {
      // If the account is not verified, throw an exception
      throw new ForbiddenException(
        `Your account has not been verified. Please verify your account by requesting a verification code.`,
      );
    }

    //If the password matches, reset the login_count and unlock the account if needed
    findcustomer.loginCount = 0;
    findcustomer.isLoggedIn = true;
    await this.customerrepo.save(findcustomer);

    //save the notification
    const notification = new Notifications();
    notification.account = findcustomer.firstname;
    notification.subject = 'Photographer just logged in!';
    notification.notification_type = NotificationType.LOGGED_IN;
    notification.message = `Hello ${findcustomer.firstname}, just logged in `;
    await this.notificationrepo.save(notification);

    return await this.signToken(
      findcustomer.id,
      findcustomer.email,
      findcustomer.role,
    );
  }
}
