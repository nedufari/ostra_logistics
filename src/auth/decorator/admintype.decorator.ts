import { SetMetadata } from "@nestjs/common";
import { AdminType } from "src/Enums/all-enums";


//decorator for the admitype
export const ADMIN_TYPE_KEY = 'admintype'
export const AdminTypes=(...admintype:AdminType[])=>SetMetadata(ADMIN_TYPE_KEY,admintype);
