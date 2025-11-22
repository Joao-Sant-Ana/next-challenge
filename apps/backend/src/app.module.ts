import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ZonesModule } from './zones/zones.module';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [UsersModule, ZonesModule, AuthModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
