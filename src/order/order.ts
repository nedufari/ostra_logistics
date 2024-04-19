import { CustomerEntity } from "src/Entity/customers.entity"
import { RiderEntity } from "src/Entity/riders.entity"
import { OrderStatus, ParcelStatus, PaymentStatus, PriorityDeliveryType } from "src/Enums/all-enums"
import { BidStatus, VehicleType } from "src/Enums/all-enums"


export interface IOrder{
    id:number

    //parcel information and  pick up details
    parcel_name :string,
    product_category:string[],
    quantity:number,
    parcelWorth : string,
    weight_of_parcel:number,
    describe_weight_of_parcel?:string
    customer:CustomerEntity,
    pickup_phone_number:string,
    pickup_address:string
    house_apartment_number_of_pickup:string,
    Area_of_pickup:string
    landmark_of_pickup:string,
    note_for_rider:string

    //drop off details 
    Recipient_name : string
    Recipient_phone_number :string
    dropOff_address:string
    house_apartment_number_of_dropoff:string,
    Area_of_dropoff:string
    landmark_of_dropoff:string,

    //order info 
    vehicleType:VehicleType
    delivery_type :PriorityDeliveryType
    schedule_date: Date
    initial_cost: number;

    //other related data needed for processses
    distance:number,
    bidStatus : BidStatus
    pickupLat: number;
    pickupLong: number;
    dropOffLat: number;
    dropOffLong: number;

    //after bid is accepted
    payment_status: PaymentStatus
    payment_verifiedAT: Date
    pickupTime:Date,
    dropOffTime:Date,
    
    trackingID:string 
    dropoffCode :string
    
    order_status:OrderStatus
    orderCreatedAtTime:Date
    RiderArrivaltime:Date
    RiderAssignedAT:Date
    Rider:RiderEntity
    accepted_cost_of_delivery : number
   
}

interface ICustomerInfo{
    firstname:string,
    profile_pics:string

}

export interface IOrderPreview{
    id:number
    vehicleType:VehicleType
    pickup:string
    dropOff:string
    distance:number,
    weight_kg:number,
    describe_weight?:string
    description:string
    parcelWorth : string 
    bidStatus : BidStatus
    order_status:OrderStatus
    orderCreatedAtTime:Date


}

export interface IOrderRequestFromCustomerToAdmin{
    parcel_name :string,
    product_category:string[],
    quantity:number,
    parcelWorth : string,
    weight_of_parcel:number,
    describe_weight_of_parcel?:string
    customer:CustomerEntity,
    pickup_phone_number:string,
    pickup_address:string
    house_apartment_number_of_pickup:string,
    Area_of_pickup:string
    landmark_of_pickup:string,
    note_for_rider:string

    //drop off details 
    Recipient_name : string
    Recipient_phone_number :string
    dropOff_address:string
    house_apartment_number_of_dropoff:string,
    Area_of_dropoff:string
    landmark_of_dropoff:string,

    //order info 
    vehicleType:VehicleType
    delivery_type :PriorityDeliveryType
    schedule_date: Date
    initial_cost: number;

    //rider info
    Rider:RiderEntity

}

export interface ITrackingOrderResponse{
    id:number
    order_status:OrderStatus
    bidAcceptedTime:Date
    orderCreatedAtTime:Date
    currentTimeAway : Date
    pickupTime:Date,
    dropOffTime:Date,
    payment_verifiedAT: Date
    RiderArrivaltime:Date
    RiderAssignedAT:Date


}
