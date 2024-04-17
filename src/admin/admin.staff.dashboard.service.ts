import { Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AdminEntity } from "src/Entity/admins.entity";
import { Notifications } from "src/Entity/notifications.entity";
import { RiderEntity } from "src/Entity/riders.entity";
import { NotificationRepository } from "src/common/common.repositories";
import { UploadService } from "src/common/helpers/upload.service";
import { CustomerAuthService } from "src/customer/customer.auth.service";
import { AdminRepository } from "./admin.repository";
import { RidersRepository } from "src/Riders/riders.repository";
import { ICreateAdmins } from "./admin";
import { AdminRiderDashboardService } from "./admin.riders.dashboard.service";
import { AdminAccessLevels, NotificationType, Role } from "src/Enums/all-enums";
import { RegisterOtherAdminByAdminDto, UpdateOtherAdminInfoByAdminDto } from "./admin.dto";
import { IChangeRiderPassword } from "src/Riders/riders";
import { ILike } from "typeorm";

@Injectable()
export class AdminStaffDasboardService{
    constructor(@InjectRepository(RiderEntity) private readonly riderripo: RidersRepository,
    @InjectRepository(AdminEntity) private readonly adminripo: AdminRepository,
    @InjectRepository(Notifications)
    private readonly notificationripo: NotificationRepository,
    private uploadservice: UploadService,
    private customerauthservice: CustomerAuthService,
    private adminriderservice:AdminRiderDashboardService){}


    //admin register rider
  async RegisterStaff(

    dto: RegisterOtherAdminByAdminDto,
    
  ): Promise<{ message: string; response: ICreateAdmins }> {
   

    const genpassword = await this.adminriderservice.generatePassword();
    const hashedpassword =
      await this.customerauthservice.hashpassword(genpassword);

    const genEmailsuffix = await this.adminriderservice.generatEmailSuffixNumber();
    const emailfromfirstname = dto.firstname;
    const emaildomain = '_staff@ostralogistics.com';
    const emailnow = emailfromfirstname + genEmailsuffix + emaildomain;

    const dob = new Date(dto.DOB);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

   
    //register new rider
    const newadmin = new AdminEntity();
    (newadmin.firstname = dto.firstname), 
    (newadmin.lastname = dto.lastname);
    newadmin.email = emailnow;
    newadmin.password = hashedpassword;
  
    (newadmin.DOB = dto.DOB),
    (newadmin.age = age),
    (newadmin.mobile = dto.mobile),
    newadmin.marital_status = dto.marital_status;
    newadmin.home_address = dto.home_address;
    (newadmin.state_of_origin = dto.state_of_origin),
      (newadmin.LGA_of_origin = dto.LGA_of_origin)
      newadmin.role = Role.ADMIN,
      newadmin.adminAccessLevels = dto.accesslevel,
      newadmin.admintype = dto.admintype
    
    //find if rider already exists
    const findadmin = await this.adminripo.findOne({
      where: { email: emailnow },
    });
    if (findadmin)
      throw new NotAcceptableException(
        `email: ${emailnow} already exists, please generate another one`,
      );

    await this.adminripo.save(newadmin);

    //customize return response
    const riderresponse: ICreateAdmins = {
      id: newadmin.id,
      firstname: newadmin.firstname,
      lastname: newadmin.lastname,
      profile_picture: newadmin.profile_picture,
      email: newadmin.email,
      password: genpassword,
      DOB: newadmin.DOB,
      age: newadmin.age,
      mobile: newadmin.mobile,
      home_address: newadmin.home_address,
      state_of_origin: newadmin.state_of_origin,
      LGA_of_origin: newadmin.LGA_of_origin,
      RegisteredAt: newadmin.RegisteredAt,
      role:newadmin.role,
      marital_status:newadmin.marital_status,
      adminAccessLevels:newadmin.adminAccessLevels,
      admintype:newadmin.admintype,
      gender:newadmin.gender,
      LGA_of_Home_Address:newadmin.LGA_of_Home_Address,
    
    };

    //save notification
    const notification = new Notifications();
    notification.account = "super admin";
    notification.subject = 'Admin Registered another admin  !';
    notification.notification_type = NotificationType.ADMIN_CREATED;
    notification.message = `a new admin  has ben created on ostra logistics platform `;
    await this.notificationripo.save(notification);

    return {
      message: 'the rider has been Registered Successfuly',
      response: riderresponse,
    };
  }

  async UpdateStaffInfoByAdmin(
  
    adminId: string,
    dto: UpdateOtherAdminInfoByAdminDto,
  ): Promise<{ message: string; response: ICreateAdmins }> {
   

    const findotheradmin = await this.adminripo.findOne({
      where: { id: adminId },
    });
    if (!findotheradmin)
      throw new NotFoundException(
        `staff with id:${adminId} is not found in the ostra logistics staff database`,
      );

    const genpassword = await this.adminriderservice.generatePassword();

    const dob = new Date(dto.DOB);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();

   
    //update other admin record
    const updateadmin = new AdminEntity();
    (updateadmin.firstname = dto.firstname), 
    (updateadmin.lastname = dto.lastname);
    (updateadmin.DOB = dto.DOB),
    (updateadmin.age = age),
    (updateadmin.mobile = dto.mobile),
    updateadmin.marital_status = dto.marital_status;
    updateadmin.home_address = dto.home_address;
    (updateadmin.state_of_origin = dto.state_of_origin),
    (updateadmin.LGA_of_origin = dto.LGA_of_origin)
    updateadmin.adminAccessLevels = dto.accesslevel,
    updateadmin.admintype = dto.admintype
     

    await this.adminripo.save(updateadmin);

   
    //customize return response
    const riderresponse: ICreateAdmins = {
        id: updateadmin.id,
        firstname: updateadmin.firstname,
        lastname: updateadmin.lastname,
        profile_picture: updateadmin.profile_picture,
        email: updateadmin.email,
        password: genpassword,
        DOB: updateadmin.DOB,
        age: updateadmin.age,
        mobile: updateadmin.mobile,
        home_address: updateadmin.home_address,
        state_of_origin: updateadmin.state_of_origin,
        LGA_of_origin: updateadmin.LGA_of_origin,
        RegisteredAt: updateadmin.RegisteredAt,
        role:updateadmin.role,
        marital_status:updateadmin.marital_status,
        adminAccessLevels:updateadmin.adminAccessLevels,
        admintype:updateadmin.admintype,
        gender:updateadmin.gender,
        LGA_of_Home_Address:updateadmin.LGA_of_Home_Address,
      
      };

    //save notification
    const notification = new Notifications();
    notification.account = "super admin";
    notification.subject = 'Admin Updated The Record of a Rider !';
    notification.notification_type = NotificationType.RIDER_INFO_UPDATED;
    notification.message = `the record of the rider with the id ${adminId} has been updated  on ostra logistics platform `;
    await this.notificationripo.save(notification);

    return {
      message: 'The information of the Rider has been Updated Successfully',
      response: riderresponse,
    };
  }



  //admin delete rider
  async AdminDeleteStaff(

    adminID: string,
  ): Promise<{ message: string | InternalServerErrorException }> {
  

    const findotheradmin = await this.adminripo.findOne({
      where: { id: adminID },
    });
    if (!findotheradmin)
      throw new NotFoundException(
        `staff with id:${adminID} is not found in the ostra logistics staff database`,
      );

    //remove rider from the platorm
    await this.adminripo.remove(findotheradmin);

    //save the notification
    const notification = new Notifications();
    notification.account = "super admin";
    notification.subject = 'Staff deleted !';
    notification.notification_type = NotificationType.ADMIN_DELETED;
    notification.message = `the staff with id ${adminID}  has been deleted from the ostra logistics application by superAdmin `;
    await this.notificationripo.save(notification);

    return {
      message: ` ${findotheradmin.firstname}  has been deleted  by the super admin `,
    };
  }

  // admin change rider password

  async AdminChangeStaffPassword(
    
    staffID: string,
  ): Promise<{ message: string; response: IChangeRiderPassword }> {
     

    const findstaff = await this.riderripo.findOne({
      where: { id: staffID },
    });
    if (!findstaff)
      throw new NotFoundException(
        `rider with id:${staffID} is not found in the ostra logistics rider database`,
      );

    //change tthe password
    const genpassword = await this.adminriderservice.generatePassword();
    const hashedpassword =
      await this.customerauthservice.hashpassword(genpassword);

    findstaff.password = hashedpassword;
    await this.adminripo.save(findstaff);

    //save the notification
    const notification = new Notifications();
    notification.account = "super admin";
    notification.subject = 'Staff password changed !';
    notification.notification_type = NotificationType.ADMIN_PASSWORD_CHANGED;
    notification.message = `the Staff with id ${staffID} password has been changed on the admin portal of ostra ogistics by superadmin  `;
    await this.notificationripo.save(notification);

    // customised response
    const newpasswordresponse: IChangeRiderPassword = {
      password: genpassword,
    };

    return {
      message: 'Staff password have been changed successflly ',
      response: newpasswordresponse,
    };
}

async GetAllStaffs(
  page: number = 1,
  limit: number = 10,
): Promise<AdminEntity[] | InternalServerErrorException> {
  const skip = (page - 1) * limit;

  //fetch staffs with pagination
  const findallriders = await this.adminripo.findAndCount({
    order: { RegisteredAt: 'DESC' },
    take: limit,
    skip: skip,
  });
  return;
}


  //admin get one staff by id
  async GetOneStaffByID(
    staffID: string,
  ): Promise<AdminEntity | InternalServerErrorException> {
    const findriderbyid = await this.riderripo.findOne({
      where: { id: staffID },
    });
    if (!findriderbyid)
      throw new NotFoundException(
        `staff with id:${staffID} is not found in the ostra logistics rider database`,
      );
    return;
  }

  //admin search for an admin
  async SearchForStaff(
    keyword: any | string,
  ) {
    try {
      const rider = await this.adminripo.findAndCount({
        where: [
          {firstname: ILike(`%${keyword}%`)},
          {lastname: ILike(`%${keyword}%`)},
          {email: ILike(`%${keyword}%`)},
        ],
        cache: false,
        comment:
          'searching for a staff with either of the keywords , lastname or firstname or email',
      });
     
  
      if (rider[1]===0)
        throw new NotFoundException(
          `no search result found for ${keyword} on the staff database `,
        );

  
      return { message: 'staff found', searchedRider:rider };
    } catch (error) {
      throw new InternalServerErrorException("An error occured while searching for staff")
      
    }
  }

}