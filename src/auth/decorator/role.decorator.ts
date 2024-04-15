import { SetMetadata } from "@nestjs/common";
import { Role } from "src/Enums/all-enums";


//decorator for the admitype
export const ROLE_KEY = 'role'
export const Roles=(...role:Role[])=>SetMetadata(ROLE_KEY,role);
