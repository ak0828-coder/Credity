import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { IdentityModule } from './identity/identity.module';

@Module({
  imports: [AuthModule, IdentityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
