import { AuthenticationController } from '@controllers/authentication/login.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}