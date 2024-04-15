
import { AdminEntity } from "src/Entity/admins.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(AdminEntity)
export class AdminRepository extends Repository<AdminEntity>{}