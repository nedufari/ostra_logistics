import { OrderEntity } from "src/Entity/orders.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(OrderEntity)
export class OrderRepository extends Repository<OrderEntity>{}