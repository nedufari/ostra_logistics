import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsStrongPassword, Matches, matches } from "class-validator";
import { AdminAccessLevels, AdminType, DeliveryPriority, Gender, MaritalStatus, StateOFOrigin, VehicleType } from "src/Enums/all-enums";

export class RegisterAdminDto{
    @IsEmail()
    @IsNotEmpty()
    email:string


    @IsString()
    @IsNotEmpty()
    firstname:string

    @IsString()
    @IsNotEmpty()
    lastname:string

    @IsString()
    @IsNotEmpty()
    //@Matches(/^NGR\+234\d{13}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    mobile:string
}

export class UpdateAdminDto{

    @IsEmail()
    @IsOptional()
    email:string


    @IsString()
    @IsOptional()
    home_address:string

    @IsString()
    @IsOptional()
    firstname:string

    @IsString()
    @IsOptional()
    lastname:string

    @IsString()
    @IsOptional()
    LGA_of_Home_Address: string

    @IsString()
    @IsOptional()
    profile_picture: string 

    @IsEnum(Gender)
    gender:Gender

}

export class RegisterRiderByAdminDto{

    @IsString()
    @IsNotEmpty()
    firstname:string

    @IsString()
    @IsNotEmpty()
    lastname:string

    @IsDateString()
    @IsNotEmpty()
    DOB:string


    @IsString()
    @IsOptional()
    profile_picture:string

    @IsEnum(MaritalStatus)
    @IsNotEmpty()
    marital_status: MaritalStatus

    @IsEnum(StateOFOrigin)
    @IsNotEmpty()
    state_of_origin: StateOFOrigin

    @IsString()
    @IsNotEmpty()
   // @Matches(/^NGR\+234\d{10}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    mobile:string

    @IsString()
    @IsOptional()
    driver_license:string

    @IsString()
    @IsNotEmpty()
    home_address:string
    
    @IsString()
    @IsNotEmpty()
    LGA_of_origin:string

    @IsString()
    @IsNotEmpty()
    guarantor1_name:string

    @IsString()
    @IsNotEmpty()
    guarantor1_relatioship_with_rider:string

    @IsString()
    @IsNotEmpty()
    //@Matches(/^NGR\+234\d{10}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    gurantor1_mobile:string

    @IsString()
    @IsOptional()
    guarantor1_picture:string

    @IsString()
    @IsNotEmpty()
    guarantor2_name:string

    @IsString()
    @IsNotEmpty()
    guarantor2_relatioship_with_rider:string

    @IsString()
    @IsNotEmpty()
    //@Matches(/^NGR\+234\d{10}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    gurantor2_mobile:string

    @IsString()
    @IsOptional()
    guarantor2_picture:string

}



export class UpdateRiderInfoByAdminDto{

    @IsString()
    @IsOptional()
    firstname:string

    @IsString()
     @IsOptional()
    lastname:string

   

    @IsDateString()
     @IsOptional()
    DOB:string

    @IsEnum(MaritalStatus)
    @IsOptional()
    marital_status: MaritalStatus

    @IsEnum(StateOFOrigin)
    @IsOptional()
    state_of_origin: StateOFOrigin

    @IsString()
    @IsOptional()
    //@Matches(/^NGR\+234\d{10}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    mobile:string

    @IsString()
    @IsOptional()
    driver_license:string

    @IsString()
    @IsOptional()
    home_address:string
    
    @IsString()
    @IsOptional()
    LGA_of_origin:string

    @IsString()
    @IsOptional()
    guarantor1_name:string

    @IsString()
     @IsOptional()
    guarantor1_relatioship_with_rider:string

    @IsString()
     @IsOptional()
    //@Matches(/^NGR\+234\d{10}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    gurantor1_mobile:string

   

    @IsString()
    @IsOptional()
    guarantor2_name:string

    @IsString()
    @IsOptional()
    guarantor2_relatioship_with_rider:string

    @IsString()
    @IsOptional()
    //@Matches(/^NGR\+234\d{10}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    gurantor2_mobile:string

   

}




export class RegisterOtherAdminByAdminDto{

    @IsString()
    @IsNotEmpty()
    firstname:string

    @IsString()
    @IsNotEmpty()
    lastname:string

    @IsDateString()
    @IsNotEmpty()
    DOB:string


    @IsString()
    @IsNotEmpty()
    profile_picture:string

    @IsEnum(MaritalStatus)
    @IsNotEmpty()
    marital_status: MaritalStatus

    @IsEnum(StateOFOrigin)
    @IsNotEmpty()
    state_of_origin: StateOFOrigin

    @IsString()
    @IsNotEmpty()
    @Matches(/^NGR\+234\d{10}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    mobile:string

    @IsString()
    @IsNotEmpty()
    home_address:string
    
    @IsString()
    @IsNotEmpty()
    LGA_of_origin:string

    @IsEnum(AdminAccessLevels)
    @IsNotEmpty()
    accesslevel : AdminAccessLevels

    @IsEnum(AdminType)
    @IsNotEmpty()
    admintype:AdminType

}


export class UpdateOtherAdminInfoByAdminDto{

    @IsString()
    @IsOptional()
    firstname:string

    @IsString()
    @IsOptional()
    lastname:string

    @IsDateString()
    @IsOptional()
    DOB:string


    @IsString()
    @IsOptional()
    profile_picture:string

    @IsEnum(MaritalStatus)
    @IsOptional()
    marital_status: MaritalStatus

    @IsEnum(StateOFOrigin)
    @IsOptional()
    state_of_origin: StateOFOrigin

    @IsString()
    @IsOptional()
    @Matches(/^NGR\+234\d{10}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    mobile:string

    @IsString()
    @IsOptional()
    home_address:string
    
    @IsString()
    @IsOptional()
    LGA_of_origin:string

    @IsEnum(AdminAccessLevels)
    @IsOptional()
    accesslevel : AdminAccessLevels

    @IsEnum(AdminType)
    @IsOptional()
    admintype:AdminType

}


