import { BidEntity } from "src/Entity/bids.entity";
import { Notifications } from "src/Entity/notifications.entity";
import { UserOtp } from "src/Entity/otp.entity";
import { EntityRepository, Repository } from "typeorm";

@EntityRepository(UserOtp)
export class OtpRepository extends Repository<UserOtp>{}

   

@EntityRepository(Notifications)
export class NotificationRepository extends Repository<Notifications>{}

@EntityRepository(BidEntity)
export class BidRepository extends Repository<BidEntity>{}