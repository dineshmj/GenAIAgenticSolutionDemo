import { Module } from '@nestjs/common';
import { SavingsBankAccountController } from '@controllers/bankaccount/bankaccount.controller';
import { ISavingsBankAccountService } from 'src/services/ISavingsBankAccountService';
import { SavingsBankAccountService } from 'src/services/SavingsBankAccountService';
import { SavingsBankAccountBizValidator } from 'src/services/validators/SavingsBankAccountBizValidator';

@Module({
  controllers: [SavingsBankAccountController],
  providers: [
    { provide: 'ISavingsBankAccountService', useClass: SavingsBankAccountService },
    { provide: 'ISavingsBankAccountBizValidator', useClass: SavingsBankAccountBizValidator },
  ],
  exports: ['ISavingsBankAccountService'], // Export if used in other modules
})
export class SavingsBankAccountModule {}