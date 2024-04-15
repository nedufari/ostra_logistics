
import { RiderEntity } from "src/Entity/riders.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(RiderEntity)
export class RidersRepository extends Repository<RiderEntity>{}