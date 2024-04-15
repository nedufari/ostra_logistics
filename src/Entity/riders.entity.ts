import { MaritalStatus, Role, StateOFOrigin } from "src/Enums/all-enums";
import { IRider } from "src/Riders/riders";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderEntity } from "./orders.entity";

@Entity({name:"Riders",})
export class RiderEntity implements IRider{
    @PrimaryGeneratedColumn()
    id:string

    @Column({nullable:false,unique:true})
    email: string;

    @Column({nullable:false})
    firstname: string;

    @Column({nullable:false})
    lastname: string;

    @Column({nullable:true})
    profile_picture: string;

    @Column({nullable:false, type:'enum', enum:Role, default:Role.RIDER})
    role: Role;

    @Column({nullable:false})
    password: string;

    @Column({nullable:false})
    mobile: string;

    @Column({nullable:true})
    age:number

    @Column({nullable:true})
    driver_license: string;

    @Column({nullable:true})
    DOB: string;

    @Column({type:'enum', enum:StateOFOrigin})
    state_of_orgin: StateOFOrigin;

    @Column({type:'enum', enum:MaritalStatus})
    marital_status: MaritalStatus;

    @Column({nullable:true})
    home_address: string;

    @Column({nullable:true})
    LGA_of_origin: string;

    @Column({nullable:true})
    guarantor1_name: string;

    @Column({nullable:true})
    guarantor1_picture: string;

    @Column({nullable:true})
    guarantor1_relatioship_with_rider: string;

    @Column({nullable:true})
    gurantor1_mobile: string;

    @Column({nullable:true})
    guarantor2_name: string;

    @Column({nullable:true})
    guarantor2_picture: string;

    @Column({nullable:true})
    guarantor2_relatioship_with_rider: string;

    @Column({nullable:true})
    gurantor2_mobile: string;


    @UpdateDateColumn({nullable:true})
    UpdatedAt:Date

    @CreateDateColumn({nullable:false})
    RegisteredAt:Date

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

    @CreateDateColumn()
    locked_until: Date;

    @OneToOne(()=>OrderEntity,order=> order.Rider)
    assigned_order:OrderEntity
    

    
}