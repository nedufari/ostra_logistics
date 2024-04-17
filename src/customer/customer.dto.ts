import { IsCreditCard, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsStrongPassword, Matches, MaxLength } from "class-validator";
import { DeliveryPriority, Gender, VehicleType } from "src/Enums/all-enums";
import { Match } from "src/common/helpers/match.decorator";

export class RegisterCustomerDto{
    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsString()
    @IsNotEmpty()
    //@Matches(/^NGR\+234\d{13}$/,{message:"mobile number must be a valid Nigerian service operator's cell number"})
    mobile:string


    @IsString()
    @IsNotEmpty()
    firstname:string

    @IsString()
    @IsNotEmpty()
    lastname:string
}

export class addPasswordDto{

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword({
        minLength:8,
        minLowercase:1,
        minNumbers:1,
        minSymbols:1,
        minUppercase:1
    })
    password:string 

    @IsString()
    @IsNotEmpty()
    @Match('password', { message: 'ConfirmPassword does not match the new password.' })
    confirmPassword:string 

}


export class ChangePasswordDto{

    @IsString()
    @IsNotEmpty()
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
    password:string 

    @IsString()
    @IsNotEmpty()
    @Match('password', { message: 'ConfirmPassword does not match the new password.' })
    confirmPassword:string 

}

export class UpdateCustomerDto{

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
    @IsOptional()
    gender:Gender

}

export class placeOrderDto{
    @IsString()
    @IsNotEmpty()
    location: string

    @IsEnum(VehicleType)
    @IsNotEmpty()
    vehicle_type: VehicleType

    @IsNumber()
    @IsNotEmpty()
    bid: number

    @IsEnum(DeliveryPriority)
    @IsNotEmpty()
    delivery_proprity: DeliveryPriority

    delivery_date?: Date
}


export class CardDetailsDto {
    @IsNotEmpty()
    @IsCreditCard()
    cardNumber: string;
  
    @IsNotEmpty()
    @MaxLength(4)
    @IsString()
    expiryMonth: string;
  
    @IsNotEmpty()
    @MaxLength(4)
    @IsString()
    expiryYear: string;
  
    @IsNotEmpty()
    @MaxLength(3)
    @IsString()
    cvv: string;
  }


