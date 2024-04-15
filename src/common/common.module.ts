import { Module } from "@nestjs/common";
import { websocketgw } from "./gateways/websockets.gateway";
import { DistanceService } from "./services/distance.service";
import { UploadService } from "./helpers/upload.service";
import { Mailer } from "./mailer/mailer.service";
import { GeoCodingService } from "./services/goecoding.service";

@Module({
    imports:[],
    providers:[websocketgw,DistanceService,UploadService,Mailer,GeoCodingService],
    controllers:[],
    exports:[DistanceService,UploadService,Mailer,GeoCodingService]
})
export class CommonModule{}