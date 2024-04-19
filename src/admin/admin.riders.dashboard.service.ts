import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminEntity } from 'src/Entity/admins.entity';
import { CustomerEntity } from 'src/Entity/customers.entity';
import { RiderEntity } from 'src/Entity/riders.entity';
import { RidersRepository } from 'src/Riders/riders.repository';
import { CustomerRepository } from 'src/customer/customer.repository';
import { AdminRepository } from './admin.repository';
import { Notifications } from 'src/Entity/notifications.entity';
import { NotificationRepository } from 'src/common/common.repositories';
import { UploadService } from 'src/common/helpers/upload.service';
import { CustomerAuthService } from 'src/customer/customer.auth.service';
import { Mailer } from 'src/common/mailer/mailer.service';
import { customAlphabet } from 'nanoid';
import {
  IChangeRiderPassword,
  IRegisterRider,
  IRider,
} from 'src/Riders/riders';
import {
  RegisterRiderByAdminDto,
  UpdateRiderInfoByAdminDto,
} from './admin.dto';
import { NotificationType, PaymentStatus } from 'src/Enums/all-enums';
import { ILike } from 'typeorm';
import { OrderEntity } from 'src/Entity/orders.entity';
import { OrderRepository } from 'src/order/order.reposiroty';

@Injectable()
export class AdminRiderDashboardService {
  constructor(
    @InjectRepository(RiderEntity) private readonly riderripo: RidersRepository,
    @InjectRepository(AdminEntity) private readonly adminripo: AdminRepository,
    @InjectRepository(Notifications)
    private readonly notificationripo: NotificationRepository,
    @InjectRepository(OrderEntity)
    private readonly orderripo: OrderRepository,
    private uploadservice: UploadService,
    private customerauthservice: CustomerAuthService,
    private mailer: Mailer,
  ) {}

  public generatePassword(): string {
    const nanoid = customAlphabet(
      '1234567890abcdefghijklmopqrstuvwxyzABCDEFGHIJKLMOPQRSTUVWXYZ@#*!(){}[]/|``^&$',
      12,
    );
    return nanoid();
  }

  public generatEmailSuffixNumber(): string {
    const nanoid = customAlphabet('1234567890', 2);
    return nanoid();
  }

  //admin register rider
  async RegisterRider(
    dto: RegisterRiderByAdminDto,
  ): Promise<{ message: string; response: IRegisterRider }> {
    const genpassword = await this.generatePassword();
    const hashedpassword =
      await this.customerauthservice.hashpassword(genpassword);

    const genEmailsuffix = await this.generatEmailSuffixNumber();
    const emailfromfirstname = dto.firstname;
    const emaildomain = '_rider@ostralogistics.com';
    const emailnow = emailfromfirstname + genEmailsuffix + emaildomain;

    const dob = new Date(dto.DOB);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    //register new rider
    const rider = new RiderEntity();
    (rider.firstname = dto.firstname), (rider.lastname = dto.lastname);
    rider.email = emailnow;
    rider.password = hashedpassword;
    (rider.DOB = dto.DOB),
      (rider.age = age),
      (rider.mobile = dto.mobile),
      (rider.marital_status = dto.marital_status);
    rider.home_address = dto.home_address;
    (rider.state_of_orgin = dto.state_of_origin),
      (rider.LGA_of_origin = dto.LGA_of_origin),
      (rider.guarantor1_name = dto.guarantor1_name);

    rider.guarantor1_relatioship_with_rider =
      dto.guarantor1_relatioship_with_rider;
    rider.gurantor1_mobile = dto.mobile;
    rider.guarantor2_name = dto.guarantor2_name;
    rider.guarantor2_relatioship_with_rider =
      dto.guarantor2_relatioship_with_rider;

    //find if rider already exists
    const findrider = await this.riderripo.findOne({
      where: { email: emailnow },
    });
    if (findrider)
      throw new NotAcceptableException(
        `email: ${emailnow} already exists, please generate another one`,
      );

    await this.riderripo.save(rider);

    //customize return response
    const riderresponse: IRegisterRider = {
      id: rider.id,
      firstname: rider.firstname,
      lastname: rider.lastname,
      profile_picture: rider.profile_picture,
      email: rider.email,
      password: genpassword,
      DOB: rider.DOB,
      age: rider.age,
      mobile: rider.mobile,
      home_address: rider.home_address,
      state_of_origin: rider.state_of_orgin,
      LGA_of_origin: rider.LGA_of_origin,
      driver_licence: rider.driver_license,
      RegisteredAt: rider.RegisteredAt,
      guarantor1_name: rider.guarantor1_name,
      gurantor1_mobile: rider.gurantor1_mobile,
      guarantor1_relatioship_with_rider:
        rider.guarantor1_relatioship_with_rider,
      guarantor1_picture: rider.guarantor1_picture,
      guarantor2_name: rider.guarantor2_name,
      gurantor2_mobile: rider.gurantor2_mobile,
      guarantor2_relatioship_with_rider:
        rider.guarantor2_relatioship_with_rider,
      guarantor2_picture: rider.guarantor2_picture,
    };

    //save notification
    const notification = new Notifications();
    notification.account = 'admin';
    notification.subject = 'Admin Registered a Rider !';
    notification.notification_type = NotificationType.RIDER_REGISTERED;
    notification.message = `a new rider has ben created on ostra logistics platform `;
    await this.notificationripo.save(notification);

    return {
      message: 'the rider has been Registered Successfully',
      response: riderresponse,
    };
  }

  //update rider information

  async UpdateRiderInfoByAdmin(
    riderId: string,
    dto: UpdateRiderInfoByAdminDto,
  ): Promise<{ message: string; response: IRegisterRider }> {
    const findriderbyid = await this.riderripo.findOne({
      where: { id: riderId },
    });
    if (!findriderbyid)
      throw new NotFoundException(
        `rider with id:${riderId} is not found in the ostra logistics rider database`,
      );

    const genpassword = await this.generatePassword();

    const dob = new Date(dto.DOB);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

    //update record
    const rider = new RiderEntity();
    (rider.firstname = dto.firstname),
      (rider.lastname = dto.lastname),
      (rider.DOB = dto.DOB),
      (rider.age = age),
      (rider.mobile = dto.mobile),
      (rider.marital_status = dto.marital_status);
    rider.home_address = dto.home_address;
    (rider.state_of_orgin = dto.state_of_origin),
      (rider.LGA_of_origin = dto.LGA_of_origin),
      (rider.guarantor1_name = dto.guarantor1_name);

    rider.guarantor1_relatioship_with_rider =
      dto.guarantor1_relatioship_with_rider;
    rider.gurantor1_mobile = dto.mobile;
    rider.guarantor2_name = dto.guarantor2_name;

    rider.guarantor2_relatioship_with_rider =
      dto.guarantor2_relatioship_with_rider;

    await this.riderripo.save(rider);

    //customize response
    const riderresponse: IRegisterRider = {
      id: rider.id,
      firstname: rider.firstname,
      lastname: rider.lastname,
      profile_picture: rider.profile_picture,
      email: rider.email,
      password: genpassword,
      DOB: rider.DOB,
      age: rider.age,
      mobile: rider.mobile,
      home_address: rider.home_address,
      state_of_origin: rider.state_of_orgin,
      LGA_of_origin: rider.LGA_of_origin,
      driver_licence: rider.driver_license,
      RegisteredAt: rider.RegisteredAt,
      guarantor1_name: rider.guarantor1_name,
      gurantor1_mobile: rider.gurantor1_mobile,
      guarantor1_relatioship_with_rider:
        rider.guarantor1_relatioship_with_rider,
      guarantor1_picture: rider.guarantor1_picture,
      guarantor2_name: rider.guarantor2_name,
      gurantor2_mobile: rider.gurantor2_mobile,
      guarantor2_relatioship_with_rider:
        rider.guarantor2_relatioship_with_rider,
      guarantor2_picture: rider.guarantor2_picture,
    };

    //save notification
    const notification = new Notifications();
    notification.account = 'super admin';
    notification.subject = 'Admin Updated The Record of a Rider !';
    notification.notification_type = NotificationType.RIDER_INFO_UPDATED;
    notification.message = `the record of the rider with the id ${riderId} has been updated  on ostra logistics platform `;
    await this.notificationripo.save(notification);

    return {
      message: 'The information of the Rider has been Updated Successfully',
      response: riderresponse,
    };
  }

  async UploadRiderProfilePics(
    mediafile: Express.Multer.File,
    riderID: string,
  ): Promise<{ message: string }> {
    try {
      const findriderbyid = await this.riderripo.findOne({
        where: { id: riderID },
      });
      if (!findriderbyid)
        throw new NotFoundException(
          `rider with id:${riderID} is not found in the ostra logistics rider database`,
        );
      const display_pics = await this.uploadservice.uploadFile(mediafile);
      const mediaurl = `http://localhost:3000/api/v1/ostra-logistics_api/uploadfile/public/${display_pics}`;

      //update the image url

      findriderbyid.profile_picture = mediaurl;

      await this.riderripo.save(findriderbyid);

      return { message: 'your profile picture has been uploaded successully ' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong during profile picture upload',
      );
    }
  }

  async UploadDriverLicenseFront(
    mediafile: Express.Multer.File,
    riderID: string,
  ): Promise<{ message: string }> {
    try {
      const findriderbyid = await this.riderripo.findOne({
        where: { id: riderID },
      });
      if (!findriderbyid)
        throw new NotFoundException(
          `rider with id:${riderID} is not found in the ostra logistics rider database`,
        );
      const display_pics = await this.uploadservice.uploadFile(mediafile);
      const mediaurl = `http://localhost:3000/api/v1/ostra-logistics_api/uploadfile/public/${display_pics}`;

      //update the image url

      findriderbyid.driver_license = mediaurl;

      await this.riderripo.save(findriderbyid);

      return {
        message: 'your driver license front has been uploaded successully ',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong during profile picture upload',
      );
    }
  }

  async UploadDriverLicenseBack(
    mediafile: Express.Multer.File,
    riderID: string,
  ): Promise<{ message: string }> {
    try {
      const findriderbyid = await this.riderripo.findOne({
        where: { id: riderID },
      });
      if (!findriderbyid)
        throw new NotFoundException(
          `rider with id:${riderID} is not found in the ostra logistics rider database`,
        );
      const display_pics = await this.uploadservice.uploadFile(mediafile);
      const mediaurl = `http://localhost:3000/api/v1/ostra-logistics_api/uploadfile/public/${display_pics}`;

      //update the image url

      findriderbyid.driver_license = mediaurl;

      await this.riderripo.save(findriderbyid);

      return {
        message: 'your driver license back has been uploaded successully ',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong during profile picture upload',
      );
    }
  }

  //admin delete rider
  async AdminDeleteRider(
    riderID: string,
  ): Promise<{ message: string | BadRequestException }> {
    const findriderbyid = await this.riderripo.findOne({
      where: { id: riderID },
    });
    if (!findriderbyid)
      throw new NotFoundException(
        `rider with id:${riderID} is not found in the ostra logistics rider database`,
      );

    //remove rider from the platorm
    await this.riderripo.remove(findriderbyid);

    //save the notification
    const notification = new Notifications();
    notification.account = 'super admin';
    notification.subject = 'Rider deleted !';
    notification.notification_type = NotificationType.RIDER_DELETED;
    notification.message = `the rider with id ${riderID}  has been deleted from the ostra logistics application by superAdmin  `;
    await this.notificationripo.save(notification);

    return {
      message: ` ${findriderbyid.firstname}  has been deleted  by the super admin `,
    };
  }

  // admin change rider password

  async AdminChangeRiderPassword(
    riderID: string,
  ): Promise<{ message: string; response: IChangeRiderPassword }> {
    const findriderbyid = await this.riderripo.findOne({
      where: { id: riderID },
    });
    if (!findriderbyid)
      throw new NotFoundException(
        `rider with id:${riderID} is not found in the ostra logistics rider database`,
      );

    //change tthe password
    const genpassword = await this.generatePassword();
    const hashedpassword =
      await this.customerauthservice.hashpassword(genpassword);

    findriderbyid.password = hashedpassword;
    await this.riderripo.save(findriderbyid);

    //save the notification
    const notification = new Notifications();
    notification.account = 'super admin';
    notification.subject = 'Rider password changed !';
    notification.notification_type = NotificationType.RIDER_PASSWORD_CHANGED;
    notification.message = `the rider with id ${riderID} password has been changed on the admin portal of ostra ogistics by superadmin `;
    await this.notificationripo.save(notification);

    // customised response
    const newpasswordresponse: IChangeRiderPassword = {
      password: genpassword,
    };

    return {
      message: 'Rider password have been changed successflly ',
      response: newpasswordresponse,
    };
  }

  //admin get all riders
  async GetAllRiders(
    page: number = 1,
    limit: number = 15,
  ): Promise<RiderEntity[] | InternalServerErrorException> {
    const skip = (page - 1) * limit;

    //fetch riders with pagination
    const findallriders = await this.riderripo.findAndCount({
      order: { RegisteredAt: 'DESC' },
      take: limit,
      skip: skip,
    });
    return;
  }
  //admin get one rider by id
  async GetOneRiderByID(
    riderID: string,
  ): Promise<RiderEntity | InternalServerErrorException> {
    const findriderbyid = await this.riderripo.findOne({
      where: { id: riderID },
    });
    if (!findriderbyid)
      throw new NotFoundException(
        `rider with id:${riderID} is not found in the ostra logistics rider database`,
      );
    return;
  }

  //admin search for a rider
  async SearchForRider(keyword: any | string) {
    try {
      const rider = await this.riderripo.findAndCount({
        where: [
          { firstname: ILike(`%${keyword}%`) },
          { lastname: ILike(`%${keyword}%`) },
          { email: ILike(`%${keyword}%`) },
        ],
        cache: false,
        comment:
          'searching for a rider with either of the keywords , lastname or firstname or email',
      });

      if (rider[1] === 0)
        throw new NotFoundException(
          `no search result found for ${keyword} on the rider database `,
        );

      return { message: 'rider found', searchedRider: rider };
    } catch (error) {
      console.log(error);
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(
          'Something went wrong when trying to fetch all your cards. Please try again later.',
        );
      }
    }
  }

  //admin fetch total number of riders they have
  async totalnumberofriders(): Promise<number> {
    return await this.riderripo.count();
  }

  //admin asign tasks to a rider

  async AssignOrderToRider(
    riderID: string,
    orderID: number,
  ): Promise<{ message: string } | any> {
    try {
      const rider = await this.riderripo.findOne({
        where: { id: riderID },
      });
      if (!rider)
        throw new NotFoundException(
          `rider with id:${riderID} is not found in the ostra logistics rider database`,
        );

      const order = await this.orderripo.findOne({
        where: { id: orderID },
        relations: ['customer'],
      });
      if (!order) throw new NotFoundException('order not found ');

      //find order that the payment status has been updated to successful
      if (order && order.payment_status !== PaymentStatus.SUCCESSFUL)
        throw new NotAcceptableException(
          'the payment on this order is not successful yet, so order cannot be assigned to a driver ',
        );

      //assign the order to a driver
      order.Rider = rider;
      await this.orderripo.save(order);

      return { message: `Order ${order} assigned to rider ${order.Rider}` };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'something went wrong while trying to assign an order to a rider',
      );
    }
  }

  //admin get all rider tasks
  //admin fetch all riders with pending tasks
  //admin fetch all riders with concluded tasks
  //admin fetch all riders with ongoing tasks
}
