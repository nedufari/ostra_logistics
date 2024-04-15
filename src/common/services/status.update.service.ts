import { Injectable } from "@nestjs/common";
import { websocketgw } from "../gateways/websockets.gateway";
import { ParcelStatus } from "src/Enums/all-enums";

@Injectable()
export class UpdateStatusService{
    constructor(private readonly websocket:websocketgw){}

    async updateStatus(parcelid:string, newStatus:ParcelStatus):Promise<void>{

        //update the status in the database od the parcel 
        

        //emit event to notify rhe client about the status change 
        this.websocket.server.emit('statusUpdate',{parcelid,newStatus})

    }
}