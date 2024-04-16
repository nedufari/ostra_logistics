import { BidStatus } from "src/Enums/all-enums";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderEntity } from "./orders.entity";

export interface IBids{
    id:number,
    bidStatus: BidStatus,
    order:OrderEntity
    // bidGroupId: string;
    bid_value:number
    initialBidPlacedAt: Date;
    BidAcceptedAt: Date;
    BidDeclinedAt: Date;
    counter_bid_offer: number
    counteredAt:Date

}

export interface IInitialBidsResponse{
    id:number,
    bidStatus: BidStatus,
    order:OrderEntity
    bid_value:number
    initialBidPlacedAt: Date;

}

export interface ICounterBidResponse{
    id:number,
    bidStatus: BidStatus,
    order:OrderEntity
    bid_value:number,
    counter_bid_offer: number,
    counteredAt:Date


}

@Entity({name:'Bids'})
export class  BidEntity implements IBids{

@PrimaryGeneratedColumn()
id:number

@Column({type:'enum',enum:BidStatus,nullable:false,default:BidStatus.PENDING})
bidStatus : BidStatus

@OneToOne(()=>OrderEntity,order=>order.bid)
order : OrderEntity

// @Column({ nullable: true })
// bidGroupId: string; // New column to store the bid group identifier

@Column('numeric',{nullable:true})
bid_value: number;

@UpdateDateColumn({nullable:true})
initialBidPlacedAt: Date;

@UpdateDateColumn({nullable:true})
BidAcceptedAt: Date;

@UpdateDateColumn({nullable:true})
BidDeclinedAt: Date;

@Column('numeric',{nullable:true})
counter_bid_offer: number;

@UpdateDateColumn({nullable:true})
counteredAt:Date

}