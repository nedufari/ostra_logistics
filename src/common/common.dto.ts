import { IsArray, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsStrongPassword, ValidateNested } from "class-validator";
import { Match } from "./helpers/match.decorator";
import { BidStatus, BiddingAction, PriorityDeliveryType, VehicleType } from "src/Enums/all-enums";


export class ChangePassword{
    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({
        minLength:8,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1,
        minUppercase:1
    })
    oldPassword:string

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({
        minLength:8,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1,
        minUppercase:1
    })
    newPassword :string

    @IsString()
    @IsNotEmpty()
    @Match('newPassword',{message:"confirmPassword does not match the newPassword "})
    confirmNewPassword :string
}

export class RequestOtpResendDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
  }

  export class SendPasswordResetLinkDto{
    
    @IsString()
    @IsNotEmpty()
    email:string 

}

export class VerifyOtpDto{
    
    @IsString()
    @IsNotEmpty()
    otp:string
}

export class  VerifyOtpForResetPasswordDto{
    

    @IsString()
    @IsNotEmpty()
    otp:string  

}


export class Logindto{
    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsString()
    @IsNotEmpty()
    password:string

   
}


export class OrderDto {


    @IsString()
    @IsNotEmpty()
    parcel_name :string

    @IsArray()
    @IsNotEmpty()
    product_category:string[]

    @IsNumber()
    @IsNotEmpty()
    quantity:number

    @IsString()
    @IsNotEmpty()
    parcelWorth : string

    @IsOptional()
    @IsString()
    weight_of_parcel:number

    @IsOptional()
    @IsString()
    describe_weight_of_parcel?:string
    
    @IsString()
    @IsNotEmpty()
    pickup_phone_number:string

    @IsString()
    @IsNotEmpty()
    pickup_address:string


    @IsString()
    @IsOptional()
    house_apartment_number_of_pickup:string

    @IsString()
    @IsOptional()
    Area_of_pickup:string

    @IsString()
    @IsOptional()
    landmark_of_pickup:string

    @IsString()
    @IsOptional()
    note_for_rider:string

    //drop off details 
    @IsString()
    @IsNotEmpty()
    Recipient_name : string

    @IsString()
    @IsNotEmpty()
    Recipient_phone_number :string

    @IsString()
    @IsNotEmpty()
    dropOff_address:string

    @IsString()
    @IsOptional()
    house_apartment_number_of_dropoff:string

    @IsString()
    @IsOptional()
    Area_of_dropoff:string

    @IsString()
    @IsOptional()
    landmark_of_dropoff:string

    //order info 
    @IsEnum(VehicleType)
    @IsNotEmpty()
    vehicleType:VehicleType

    @IsString()
    @IsNotEmpty()
    delivery_type :PriorityDeliveryType

    @IsDateString()
    @IsOptional()
    schedule_date: Date
}


export class BidActionDto{
    @IsEnum(BiddingAction)
    action:BiddingAction
}

export class AdminPlaceBidDto{
    @IsNumber()
    @IsNotEmpty()
    bid:number
}

export class counterBidDto{
    @IsNumber()
    @IsNotEmpty()
    counter_bid:number
}









