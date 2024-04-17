
import { CardEntity } from "src/Entity/card.entity";
import { CustomerEntity } from "src/Entity/customers.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(CustomerEntity)
export class CustomerRepository extends Repository<CustomerEntity>{}


@EntityRepository(CardEntity)
export class CardRepository extends Repository<CardEntity>{}