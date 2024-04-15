
import { NotificationType } from "src/Enums/all-enums";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"; 
@Entity("notifications")
export class Notifications implements INotification{
    @PrimaryGeneratedColumn()
    id:number

    @CreateDateColumn({type:"date",nullable:false})
    date:Date

    @Column({nullable:false})
    account:string


    @Column({nullable:true,type:"enum", enum:NotificationType})
    notification_type:NotificationType

    @Column({nullable:false})
    message:string


    @Column({nullable:false})
    subject:string
    



    
}

export interface INotification{
    id:number
    account:string
    notification_type:NotificationType
    message:string
    subject:string
    date:Date
    
}

