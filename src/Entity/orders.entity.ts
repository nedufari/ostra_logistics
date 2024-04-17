// the table that holds all the orders and it will have its relatiohip with the customer and also have relationship with the rider who the order was assigned to and then it will be saved to the tasks given
import { BidStatus, OrderStatus, PaymentStatus, PriorityDeliveryType, VehicleType } from 'src/Enums/all-enums';
import { IOrder } from 'src/order/order';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, ManyToOne, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { CustomerEntity } from './customers.entity';
import { RiderEntity } from './riders.entity';
import { BidEntity } from './bids.entity';

@Entity('orders')
export class OrderEntity implements IOrder {
    @PrimaryGeneratedColumn()
    id: number;

    //pick up data 

    @Column({nullable:false})
    parcel_name: string;

    @Column({type:'simple-array',nullable:false})
    product_category: string[];

    @Column({nullable:false})
    quantity: number;

    @Column({nullable:false})
    parcelWorth: string;

    @Column('numeric',{nullable:true})
    weight_of_parcel: number;

    @Column({nullable:true})
    describe_weight_of_parcel?: string;

    @Column({nullable:false})
    pickup_phone_number: string;

    @Column({nullable:false})
    pickup_address: string;

    @Column({nullable:true})
    house_apartment_number_of_pickup: string;

    @Column({nullable:true})
    Area_of_pickup: string;

    @Column({nullable:true})
    landmark_of_pickup: string;

    @Column({nullable:true, length:255})
    note_for_rider: string;


    // drop off data 

    @Column({nullable:false,length:255})
    Recipient_name: string;

    @Column({nullable:false})
    Recipient_phone_number: string;

    @Column({nullable:false})
    dropOff_address: string;

    @Column({nullable:true})
    house_apartment_number_of_dropoff: string;

    @Column({nullable:true})
    Area_of_dropoff: string;

    @Column({nullable:true})
    landmark_of_dropoff: string;

    //order info

    @Column({nullable:false, type:'enum', enum:PriorityDeliveryType})
    delivery_type: PriorityDeliveryType;
   
    @Column({ type:'enum', enum:VehicleType, nullable:false })
    vehicleType: VehicleType;

    @UpdateDateColumn({nullable:true})
    schedule_date: Date;

    @Column('numeric',{nullable:false})
    initial_cost: number;


    //other related data needed for processes
    @Column('numeric',{nullable:false})
    distance: number;

    @Column({nullable:false, type:'enum', enum:BidStatus})
    bidStatus: BidStatus;

    @Column('numeric',{nullable:false})
    pickupLat: number;

    @Column('numeric',{nullable:true})
    pickupLong: number;

    @Column('numeric',{nullable:true})
    dropOffLat: number;

    @Column('numeric',{nullable:false})
    dropOffLong: number;


    // after bid accepted
    @Column({nullable:true, type:'enum', enum:PaymentStatus})
    payment_status: PaymentStatus;

    @CreateDateColumn({nullable:true})
    payment_verifiedAT: Date;

    @UpdateDateColumn({nullable:true})
    pickupTime: Date;

    @UpdateDateColumn({nullable:true})
    dropOffTime: Date;

    @Column({nullable:true, type:'enum', enum:OrderStatus})
    order_status: OrderStatus

    @UpdateDateColumn({nullable:true})
    orderCreatedAtTime: Date;

    @UpdateDateColumn({nullable:true})
    RiderArrivaltime: Date;

    @UpdateDateColumn({nullable:true})
    RiderAssignedAT: Date;

    @Column({  length: 255, nullable:true })
    trackingID: string;

    @Column({  length: 255, nullable:true })
    dropoffCode: string;

    
    @Column('numeric',{nullable:true})
    accepted_cost_of_delivery: number;


    @OneToOne(() => BidEntity, (bid) => bid.order) // Specify the inverse side
    @JoinColumn({ name: 'orderId', referencedColumnName: 'id' }) // Define join columns
    bid: BidEntity;

    @ManyToOne(()=>RiderEntity, rider =>rider.assigned_order)
    Rider: RiderEntity;
  

    @ManyToOne(()=>CustomerEntity, owner=>owner.my_orders)
    customer: CustomerEntity

    // @ManyToOne(() => BidEntity, bid => bid.id) // Many orders can be associated with one bid group
    // @JoinColumn({ name: 'bidGroupId', referencedColumnName: 'bidGroupId' })
    // bidGroup: BidEntity;
}
