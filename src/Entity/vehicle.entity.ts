import { Role, VehicleState, VehicleType } from "src/Enums/all-enums";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";



export interface IVehicle{
    id:number,
    vehicle_model: string,
    vehicle_type: VehicleType,
    color: string,
    registration_number: string,
    state_of_vehicle: VehicleState,
    RegisteredAt: Date,
    UpdatedAt: Date,
    DeletedAt: Date


}



@Entity({name:"vehicle",})
export class VehicleEntity implements IVehicle{
    @PrimaryGeneratedColumn()
    id:number

    @Column({nullable:true})
    vehicle_model: string;

    @Column({nullable:true, type:'enum', enum:Role, default:VehicleType.BIKE})
    vehicle_type: VehicleType;

    @Column({nullable:false})
    color: string;


    @Column({nullable:false})
    registration_number: string;

    
    @Column({nullable:false,type:'enum', enum:VehicleState})
    state_of_vehicle: VehicleState;

    @CreateDateColumn({nullable:true})
    RegisteredAt: Date;

    @CreateDateColumn({nullable:true})
    UpdatedAt: Date;

    @CreateDateColumn({nullable:true})
    DeletedAt: Date; 
}