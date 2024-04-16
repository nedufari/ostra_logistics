import { Module } from "@nestjs/common";
import { PaystackWebhookService} from "./webhook.service";
import { WebhookController } from "./webhook.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "src/Entity/orders.entity";

@Module({
    imports:[TypeOrmModule.forFeature([OrderEntity])],
    providers:[PaystackWebhookService],
    controllers:[WebhookController],

})
export class WebHookModule{

}