import { Module } from '@nestjs/common';
import { HomeLoanController } from '@controllers/homeloan/homeloan.controller';
import { IHomeLoanService } from 'src/services/IHomeLoanService';
import { HomeLoanService } from 'src/services/HomeLoanService';
import { HomeLoanBizValidator } from 'src/services/validators/HomeLoanBizValidator';

@Module({
  controllers: [HomeLoanController],
  providers: [
    { provide: 'IHomeLoanService', useClass: HomeLoanService },
    { provide: 'IHomeLoanBizValidator', useClass: HomeLoanBizValidator },
  ],
  exports: ['IHomeLoanService'], // Export if used in other modules
})
export class HomeLoanModule {}