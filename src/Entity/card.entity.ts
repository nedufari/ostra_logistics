import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { CustomerEntity } from "./customers.entity";

export interface ICard{
    id:number
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    card_owner:CustomerEntity
    addedAT:Date
  
}

@Entity({name:"Card"})
export class CardEntity implements ICard{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable:false})
    cardNumber: string;

    @Column({nullable:false})
    expiryMonth: string;

    @Column({nullable:false})
    expiryYear: string;

    @Column({nullable:false})
    cvv: string;

    @ManyToOne(()=>CustomerEntity, owner=>owner.my_cards)
    card_owner: CustomerEntity;

    @CreateDateColumn({nullable:false})
    addedAT: Date;
    
}