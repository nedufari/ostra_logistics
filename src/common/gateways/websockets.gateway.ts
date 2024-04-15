import { Injectable } from "@nestjs/common";
import {WebSocketGateway,WebSocketServer} from "@nestjs/websockets"
import {Server} from "socket.io"

@Injectable()
@WebSocketGateway()
export class websocketgw{
    @WebSocketServer()
    server:Server

}