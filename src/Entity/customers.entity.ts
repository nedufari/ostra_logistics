import { Gender, Role, StateOFOrigin } from "src/Enums/all-enums";
import { ICustomer } from "src/customer/customer";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderEntity } from "./orders.entity";
import { CardEntity } from "./card.entity";

@Entity({name:"Customer",})
export class CustomerEntity implements ICustomer{
    @PrimaryGeneratedColumn()
    id:string

    @Column({nullable:false,unique:true})
    email: string;

    @Column({nullable:false, type:'enum', enum:Role, default:Role.CUSTOMER})
    role: Role;

    @Column({nullable:true})
    password: string;

    @Column({nullable:false})
    firstname: string;

    @Column({nullable:false})
    lastname: string;

    @Column({nullable:false})
    mobile: string;

    @UpdateDateColumn({nullable:true,default:null})
    UpdatedAt:Date

    @CreateDateColumn({nullable:false})
    RegisteredAt:Date


    @Column({nullable:true})
    home_address:string

    @Column({nullable:true})
    profile_picture: string;

    @Column({nullable:true})
    LGA_of_Home_Address: string

    @Column({nullable:true})
    gender: Gender;



    @Column({nullable:false,default:false})
    isLoggedIn: boolean;

    @Column({nullable:false,default:false})
    isLoggedOut: boolean;

    @Column({nullable:false,default:false})
    isRegistered: boolean;

    @Column({nullable:false,default:false})
    isVerified: boolean;

    @Column({nullable:true})
    reset_link_exptime: Date;

    @Column({nullable:true})
    password_reset_link: string;

    @Column({nullable:false, default:0})
    loginCount: number;

    @Column({nullable:false, default:false})
    isLocked: boolean;

    @CreateDateColumn({default:null})
    locked_until: Date;

    @OneToMany(()=>OrderEntity, order=>order.customer)
    my_orders: OrderEntity[];

    @OneToMany(()=>CardEntity,card => card.card_owner )
    my_cards :CardEntity[]
    





    

    
    
    
}