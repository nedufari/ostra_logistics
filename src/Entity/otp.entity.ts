
import { Role } from "src/Enums/all-enums";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";



export interface IUserOtp {
    id:number
    email: string;
    otp: string;
    role: Role;
    expiration_time: Date;
    verified: boolean;
    created_at: Date;
  }

  @Entity("otp")
  export class UserOtp implements IUserOtp{
    @PrimaryGeneratedColumn()
    id:number

    @Column({unique:false}) //so that one user can improve
    email: string;

    @Column({type:'enum', enum:Role,nullable:true })
    role:Role

    @Column({type:'boolean',default:false})
    verified: boolean;

    @CreateDateColumn({ nullable:true})
    expiration_time:Date

    @CreateDateColumn({ nullable:true})
    created_at:Date

    @Column()
    otp: string;
  }