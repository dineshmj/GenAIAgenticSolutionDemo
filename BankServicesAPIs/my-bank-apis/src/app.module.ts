import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HomeLoanModule } from './modules/homeLoan/homeLoan.module';
import { HomeLoanController } from './controllers/homeloan/homeloan.controller';
import { AuthenticationController } from '@controllers/authentication/login.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './guards/jwtAuthGuard';
import { RolesGuard } from './guards/rolesGuard';
import { ConfigModule } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JWT_SIGNING_KEY } from './config/secrets';
import { SavingsBankAccountModule } from './modules/savingsBankAccount/savingsBankAccount.module';
import { SavingsBankAccountController } from '@controllers/bankaccount/bankaccount.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SIGNING_KEY,
      signOptions: { expiresIn: '1h' },  // Token expiration time
    }),
    HomeLoanModule,
    SavingsBankAccountModule,
    ConfigModule.forRoot ()],
  controllers: [AppController, HomeLoanController, SavingsBankAccountController, AuthenticationController],
  providers: [AppService, JwtAuthGuard, RolesGuard, Reflector],
  exports: [JwtModule],  // Export JwtModule if needed elsewhere
})
export class AppModule {}