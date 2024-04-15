
import { CustomerEntity } from "src/Entity/customers.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(CustomerEntity)
export class CustomerRepository extends Repository<CustomerEntity>{}