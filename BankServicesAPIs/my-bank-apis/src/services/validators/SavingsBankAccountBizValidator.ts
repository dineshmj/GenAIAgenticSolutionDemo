import { Injectable } from '@nestjs/common';
import { ISavingsBankAccountBizValidator } from './ISavingsBankAccountBizValidator';
import { BizValidationFailure } from 'src/models/BizValidationFailure';
import { SavingsBankAccount } from '@models/SavingsBankAccount';
import { InstanceState } from 'src/models/InstanceState';

@Injectable()
export class SavingsBankAccountBizValidator
    implements ISavingsBankAccountBizValidator {
  async validate(savingsBankAccount: Partial<SavingsBankAccount>, state: InstanceState): Promise<BizValidationFailure[]> {
    const validationFailures: BizValidationFailure[] = [];

    // Is Name of the customer empty or null?
    if (!savingsBankAccount.customerName || savingsBankAccount.customerName.trim() === '') {
      validationFailures.push(new BizValidationFailure('CustomerName', 'Name of the customer should not be empty.'));
    }

    // Is the ID of the customer present?
    if (!savingsBankAccount.customerId) {
      validationFailures.push(new BizValidationFailure('CustomerId', 'Customer ID should be specified.'));
    }

    // Is the savings bank account amount at least AUD 10000?
    if (savingsBankAccount.depositAmount && savingsBankAccount.depositAmount < 1000) {
      validationFailures.push(new BizValidationFailure('DepositAmount', 'The Deposit Amount must be at least AUD 1,000.'));
    }

    // Is the tenure period at least 5 years?
    if (!savingsBankAccount.location || savingsBankAccount.location.trim () === '') {
      validationFailures.push(new BizValidationFailure('Location', 'The Branch Location should not be empty.'));
    }

    // Is Property Location of the home loan empty or null?
    if (!savingsBankAccount.branchCode || savingsBankAccount.branchCode.trim() === '') {
      validationFailures.push(new BizValidationFailure('BranchCode', 'The Branch Code should not be empty.'));
    }
    
    // Applicable, only if the instance is already existing - is ID present?
    if (state == InstanceState.Existing) {
        if (savingsBankAccount.id === null && savingsBankAccount.id === undefined) {
        validationFailures.push(new BizValidationFailure('Id', 'ID of the Savings Bank Account should not be null or undefined for modifications.'));
        }
    }

    return validationFailures;
  }
}