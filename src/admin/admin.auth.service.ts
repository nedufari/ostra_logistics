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
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
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
import { AdminEntity } from 'src/Entity/admins.entity';
import { AdminRepository } from './admin.repository';
import { RegisterAdminDto } from './admin.dto';
import { CustomerAuthService } from 'src/customer/customer.auth.service';
import { IAdmin } from './admin';
import { addPasswordDto } from 'src/customer/customer.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminEntity) private readonly adminrepo: AdminRepository,
    @InjectRepository(UserOtp) private readonly otprepo: OtpRepository,
    @InjectRepository(Notifications)
    private readonly notificationrepo: NotificationRepository,
    private configservice: ConfigService,
    private customerauthservice: CustomerAuthService,
    private jwt: JwtService,
    private mailerservice: Mailer,
  ) {}

  // get customer profile
  async getProfile(adminId: string): Promise<IAdmin> {
    const admin = await this.adminrepo.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Super admin not found');
    }
    return admin;
  }

  //sign up user

  async RegisterSuperAdmin(
    dto: RegisterAdminDto,
  ): Promise<{ message: string }> {
    const checkemail = await this.adminrepo.findOne({
      where: { email: dto.email },
    });
    if (checkemail)
      throw new HttpException(
        'This super admin already exists',
        HttpStatus.FOUND,
      );


    const admin = new AdminEntity();
    admin.email = dto.email;
    admin.firstname = dto.firstname;
    admin.lastname = dto.lastname;
    admin.mobile =dto.mobile
    admin.role = Role.ADMIN;
    admin.RegisteredAt = new Date();
    admin.isRegistered = true;

    await this.adminrepo.save(admin);

    //2fa authentication
    const emiailverificationcode =
      await this.customerauthservice.generateEmailToken();

    // mail
    await this.mailerservice.SendVerificationeMail(dto.email, dto.firstname);

    //otp
    const otp = new UserOtp();
    otp.email = dto.email;
    otp.otp = emiailverificationcode;
    otp.role = admin.role;
    const twominuteslater = new Date();
    await twominuteslater.setMinutes(twominuteslater.getMinutes() + 10);
    otp.expiration_time = twominuteslater;
    await this.otprepo.save(otp);

    //save the notification
    const notification = new Notifications();
    notification.account = admin.firstname;
    notification.subject = 'New Super Admin Created!';
    notification.notification_type = NotificationType.ADMIN_CREATED;
    notification.message = `new admin created successfully `;
    await this.notificationrepo.save(notification);

    return {
      message:
        'You have successfully registered as a super admin, please check your email for the otp verification',
    };
  }

  //add password and confirm it too 
  async AddPasswordAfterVerification(adminID:string, dto:addPasswordDto):Promise<{message:string}>{
    try {
      const checkadmin = await this.adminrepo.findOne({where:{id:adminID}})
      if (!checkadmin.isVerified) throw new UnauthorizedException('sorry this admin has not been verified yet, please request for an otp to verify your account')
  
      const hashedpassword = await this.customerauthservice.hashpassword(dto.password)
  
      //add the password 
      checkadmin.password = hashedpassword
  
      await this.adminrepo.save(checkadmin)
  
      return {message:'password has been added successfully'}
 
    } catch (error) {
     throw  new InternalServerErrorException('an error occured while adding password',error)
     
    }
   }
  // verify email of admin

  async verifyEmail(
    dto: VerifyOtpDto,
  ): Promise<{ isValid: boolean; accessToken: any }> {

    //find the otp provided if it matches with the otp stored
    const findotp = await this.otprepo.findOne({ where: { otp: dto.otp } });
    if (!findotp)
      throw new NotFoundException(
        'you provided an invalid OTP,please go back to your email and confirm the OTP sent to you',
      );

    //find if the otp is expired
    if (findotp.expiration_time <= new Date())
      throw new RequestTimeoutException(
        'OTP is expired, please request for another one',
      );

    // Find the customer associated with the OTP
    const admin = await this.adminrepo.findOne({
      where: { email: findotp.email },
    });
    if (!admin)
      throw new HttpException(
        'No user found for the provided OTP.',
        HttpStatus.NOT_FOUND,
      );

    // Verify and update the customer's status
    admin.isVerified = true;
    admin.isLoggedIn = true;
    await this.adminrepo.save(admin);

    const notification = new Notifications();
    (notification.account = admin.firstname),
      (notification.subject = 'Super Admin Verified!');
    notification.notification_type = NotificationType.EMAIL_VERIFICATION;
    notification.message = `Hello ${admin.firstname}, your email has been successfully verified `;
    await this.notificationrepo.save(notification);

    //await this.mailerservice.SendWelcomeEmail(admin.email,admin.brandname)

    await this.adminrepo.save(admin);

    const accessToken = await this.customerauthservice.signToken(
      admin.id,
      admin.email,
      admin.role,
    );

    return { isValid: true, accessToken };
  }

  // resend email verification otp

  async ResendExpiredOtp(
    email: string | any,
  ): Promise<{ message: string }> {
    const emailexsist = await this.adminrepo.findOne({
      where: { email: email },
    });
    if (!emailexsist)
      throw new HttpException(
        `customer with email: ${email}doesn't exists, please use an already registered email`,
        HttpStatus.CONFLICT,
      );

    // Check if there is an expired OTP for the user
    const expiredOtp = await this.otprepo.findOne({
      where: { email: email, expiration_time: LessThan(new Date()) },
    });
    if (!expiredOtp) {
      throw new NotFoundException(
        'No expired OTP found for this user.',
        
      );
    }
    // Generate a new OTP
    const emiailverificationcode =
      await this.customerauthservice.generateEmailToken(); // Your OTP generated tokens

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

  async sendPasswordResetLink(
    dto: SendPasswordResetLinkDto,
  ): Promise<{ message: string }> {
    const isEmailReistered = await this.adminrepo.findOne({
      where: { email: dto.email },
    });
    if (!isEmailReistered)
      throw new NotFoundException(
        `this email ${dto.email} does not exist in our system, please try another email address`,
        
      );

    const resetlink = await this.customerauthservice.generateEmailToken();
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
    await this.adminrepo.save(isEmailReistered);

    const notification = new Notifications();
    (notification.account = isEmailReistered.firstname),
      (notification.subject = 'password Reset link!');
    notification.notification_type = NotificationType.EMAIL_VERIFICATION;
    notification.message = `Hello ${isEmailReistered.firstname}, password resent link sent `;
    await this.notificationrepo.save(notification);

    return { message: 'The password reset link has been sent successfully' };
  }



  //verify token sent when trying to reset password
  async VerifyResetPasswordOtp(
    dto: VerifyOtpForResetPasswordDto,
  ): Promise<{ message: string }> {

    //find the user who has the reset otp sent 
    const verifyuser = await this.adminrepo.findOne({where: { password_reset_link:dto.otp }});
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
    await this.adminrepo.save(verifyuser);

    return { message: 'otp has been verified' };
  }

//reset password 
async FinallyResetPasswordAfterVerification(adminID:string|any, dto:addPasswordDto):Promise<{message:string}>{
    try {
      const checkcustomer = await this.adminrepo.findOne({where:{id:adminID}})
      if (!checkcustomer.isVerified) throw new UnauthorizedException('sorry this customer has not been verified yet, please request for an otp to verify your account')
  
      const hashedpassword = await this.customerauthservice.hashpassword(dto.password)
  
      //add the password 
      checkcustomer.password = hashedpassword
  
      await this.adminrepo.save(checkcustomer)
  
      return {message:'password has been reset successfully'}
 
    } catch (error) {
     throw  new InternalServerErrorException('an error occured while reseting password',error)
     
    }
   }

  //login admin

  async login(logindto: Logindto) {
    const findadmin = await this.adminrepo.findOne({
      where: { email: logindto.email },
    });
    if (!findadmin)
      throw new HttpException(`invalid credential`, HttpStatus.NOT_FOUND);
    const comparepass = await this.customerauthservice.comaprePassword(
      logindto.password,
      findadmin.password,
    );
    if (!comparepass) {
      findadmin.loginCount += 1;

      if (findadmin.loginCount >= 5) {
        findadmin.isLocked = true;
        findadmin.locked_until = new Date(Date.now() + 24 * 60 * 60 * 1000); //lock for 24 hours
        await this.adminrepo.save(findadmin);
        throw new UnauthorizedException(`invalid credential`);
      }

      //  If the customer hasn't reached the maximum login attempts, calculate the number of attempts left
      const attemptsleft = 5 - findadmin.loginCount;
      await this.adminrepo.save(findadmin);

      throw new UnauthorizedException(
        `invalid credentials ${attemptsleft} attempts left before your account is locked.`,
      );
    }

    if (!findadmin.isVerified) {
      // If the account is not verified, throw an exception
      throw new ForbiddenException(
        `Your account has not been verified. Please verify your account by requesting a verification code.`,
      );
    }

    //If the password matches, reset the login_count and unlock the account if needed
    findadmin.loginCount = 0;
    findadmin.isLoggedIn = true;
    await this.adminrepo.save(findadmin);

    //save the notification
    const notification = new Notifications();
    notification.account = findadmin.firstname;
    notification.subject = 'Photographer just logged in!';
    notification.notification_type = NotificationType.LOGGED_IN;
    notification.message = `Hello ${findadmin.firstname}, just logged in `;
    await this.notificationrepo.save(notification);

    return await this.customerauthservice.signToken(
      findadmin.id,
      findadmin.email,
      findadmin.role,
    );
  }
}
