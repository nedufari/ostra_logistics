import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Role } from "src/Enums/all-enums";
import { ROLE_KEY } from "../decorator/role.decorator";


// GUARD FOR THE ADMINTYPE
@Injectable()
export class RoleGuard implements CanActivate{
    constructor(private reflector:Reflector){}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        console.log('RoleGuard executed');
        
        const requiredRole=this.reflector.getAllAndOverride<Role[]>(ROLE_KEY,[
            context.getHandler(),
            context.getClass()
        ])
        if (!requiredRole){
            return true
        }
        const {user}=context.switchToHttp().getRequest();
        return requiredRole.some(role=>user.role === role);
    }
        
    }