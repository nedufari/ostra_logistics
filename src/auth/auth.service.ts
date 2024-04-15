import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { AdminEntity } from "src/Entity/admins.entity"
import { CustomerEntity } from "src/Entity/customers.entity"
import { RiderEntity } from "src/Entity/riders.entity"
import { RidersRepository } from "src/Riders/riders.repository"
import { AdminRepository } from "src/admin/admin.repository"
import { CustomerRepository } from "src/customer/customer.repository"

@Injectable()
export class AuthService{
    constructor(@InjectRepository(AdminEntity)private readonly adminrepo:AdminRepository,
    @InjectRepository(CustomerEntity)private readonly customerrepo:CustomerRepository,
    @InjectRepository(RiderEntity)private readonly riderrepo:RidersRepository){}

    //validateuseroradminbyidandrole

    async ValidateCustomerOrRiderOrAdminByIdandRole(id:string, role:string){
        switch(role){
            case "admin":
                return await this.adminrepo.findOne({where:{id:id}})
            case "customer":
                return await this.customerrepo.findOne({where:{id:id}})
            case "rider":
                return await this.riderrepo.findOne({where:{id:id}})


            default:
                return null
        }
    }

}