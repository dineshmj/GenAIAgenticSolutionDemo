import { Injectable } from '@nestjs/common';
import { IHomeLoanBizValidator } from './IHomeLoanBizValidator';
import { BizValidationFailure } from 'src/models/BizValidationFailure';
import { HomeLoan } from '@models/HomeLoan';
import { InstanceState } from 'src/models/InstanceState';

@Injectable()
export class HomeLoanBizValidator
    implements IHomeLoanBizValidator {
  async validate(homeLoan: Partial<HomeLoan>, state: InstanceState): Promise<BizValidationFailure[]> {
    const validationFailures: BizValidationFailure[] = [];

    // Is Name of the customer empty or null?
    if (!homeLoan.customerName || homeLoan.customerName.trim() === '') {
      validationFailures.push(new BizValidationFailure('CustomerName', 'Name of the customer should not be empty.'));
    }

    // Is the ID of the customer present?
    if (!homeLoan.customerId) {
      validationFailures.push(new BizValidationFailure('CustomerId', 'Customer ID should be specified.'));
    }

    // Is the loan amount at least AUD 10000?
    if (homeLoan.loanAmount && homeLoan.loanAmount < 10000) {
      validationFailures.push(new BizValidationFailure('LoanAmount', 'The Loan Amount must be at least AUD 10,000.'));
    }

    // Is the tenure period at least 5 years?
    if (homeLoan.loanTenure && homeLoan.loanTenure < 5) {
      validationFailures.push(new BizValidationFailure('LoanTenure', 'Home Loan tenure must be at least 5 years.'));
    }

    // Is Property Location of the home loan empty or null?
    if (!homeLoan.location || homeLoan.location.trim() === '') {
      validationFailures.push(new BizValidationFailure('Location', 'Property Location of the home loan should not be empty.'));
    }
    
    // Applicable, only if the instance is already existing - is ID present?
    if (state == InstanceState.Existing) {
        if (homeLoan.id === null && homeLoan.id === undefined) {
        validationFailures.push(new BizValidationFailure('Id', 'ID of the Home Loan should not be null or undefined for modifications.'));
        }
    }

    return validationFailures;
  }
}