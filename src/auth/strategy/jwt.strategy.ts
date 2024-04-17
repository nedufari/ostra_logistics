import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy} from "passport-jwt";
import { AuthService } from "../auth.service";



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt'){
   constructor(configservice:ConfigService,
    private readonly authservice: AuthService,){
    super({
        jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey:configservice.get('SECRETKEY')
    })
   }

   async validate(payload:any){
    const{sub:id,email,role}=payload

    const user = await this.authservice.ValidateCustomerOrRiderOrAdminByIdandRole(id,role)

    if(!user) throw new UnauthorizedException('invalid token')

    user.role =role
    user.email =email

    return user
   }

  
   
}

