import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { AdminType } from "src/Enums/all-enums";
import { ADMIN_TYPE_KEY } from "../decorator/admintype.decorator";


// GUARD FOR THE ADMINTYPE
@Injectable()
export class AdminTypeGuard implements CanActivate{
    constructor(private reflector:Reflector){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        console.log('AdminGuard executed');
        
        const requiredRole=this.reflector.getAllAndOverride<AdminType[]>(ADMIN_TYPE_KEY,[
            context.getHandler(),
            context.getClass()
        ])
        if (!requiredRole){
            return true
        }
        const {user}=context.switchToHttp().getRequest();
        return requiredRole.some(admintype=>user.admintype === admintype);
    }
        
    }