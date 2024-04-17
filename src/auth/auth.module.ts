import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/Entity/customers.entity';
import { RiderEntity } from 'src/Entity/riders.entity';
import { AdminEntity } from 'src/Entity/admins.entity';
import { JwtGuard } from './guard/jwt.guard';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RoleGuard } from './guard/role.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerEntity, RiderEntity, AdminEntity]),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.SECRETKEY,
        signOptions: { expiresIn: process.env.EXPIRESIN },
      }),
    }),
  ],
  providers: [AuthService,JwtGuard,JwtStrategy,RoleGuard],
})
export class AuthModule {}
