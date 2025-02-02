import { Injectable, Inject } from '@nestjs/common';
import { BizResponse, ServiceStatus } from '../models/BizResponse';
import { BizDataResponse } from 'src/models/BizDataResponse';
import { InstanceState } from 'src/models/InstanceState';
import { SavingsBankAccount } from '../models/SavingsBankAccount';
import { ISavingsBankAccountBizValidator } from './validators/ISavingsBankAccountBizValidator';
import { ISavingsBankAccountService } from './ISavingsBankAccountService';

@Injectable()
export class SavingsBankAccountService
  implements ISavingsBankAccountService {
  private savingsBankAccounts: SavingsBankAccount[] = [
    {
      id: 1,
      customerName: 'Chuck Johns',
      customerId: 1024,
      depositAmount: 12000,
      branchCode: 'Syd001',
      location: 'Sydney',
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      customerId: 2048,
      depositAmount: 15000,
      branchCode: 'Mel001',
      location: 'Melbourne'
    },
    {
      id: 3,
      customerName: 'Alice Johnson',
      customerId: 4096,
      depositAmount: 18000,
      branchCode: 'Can001',
      location: 'Canberra'
    },
    {
      id: 4,
      customerName: 'Bob Brown',
      customerId: 8192,
      depositAmount: 10000,
      branchCode: 'Bri001',
      location: 'Brisbane'
    },
  ];

  private nextId = 5;

  constructor(@Inject('ISavingsBankAccountBizValidator') private readonly validator: ISavingsBankAccountBizValidator) {
  }

  //
  // Add new savings bank account.
  //
  async addSavingsBankAccount(newSavingsBankAccount: SavingsBankAccount): Promise<BizDataResponse<SavingsBankAccount>> {
    // Business validation
    const validationFailures = await this.validator.validate (newSavingsBankAccount, InstanceState.New);

    if (validationFailures.length > 0) {
      return new BizDataResponse(validationFailures, null);
    }

    // Add savings bank account
    newSavingsBankAccount.id = this.nextId++;
    this.savingsBankAccounts.push(newSavingsBankAccount);

    return new BizDataResponse(ServiceStatus.Created, newSavingsBankAccount);
  }

  //
  // Modify existing savings bank account.
  //
  async modifySavingsBankAccount(savingsBankAccount: SavingsBankAccount): Promise<BizResponse> {
    // Business validation
    const validationFailures = await this.validator.validate(savingsBankAccount, InstanceState.Existing);

    if (validationFailures.length > 0) {
      return new BizResponse(validationFailures);
    }

    // Find and update the savings bank account
    const index = this.savingsBankAccounts.findIndex((c) => c.id === savingsBankAccount.id);

    if (index === -1) {
      return new BizResponse(ServiceStatus.SpecificItemNotFound);
    }

    this.savingsBankAccounts[index] = savingsBankAccount;
    return new BizResponse(ServiceStatus.Modified);
  }

  //
  // Get the specific savings bank account whose ID is provided.
  //
  async getSavingsBankAccountById(id: number): Promise<BizDataResponse<SavingsBankAccount>> {
    const savingsBankAccount = this.savingsBankAccounts.find(c => c.id === +id);

    if (!savingsBankAccount) {
      return new BizDataResponse(
        ServiceStatus.SpecificItemNotFound,
        savingsBankAccount
      );
    }

    return new BizDataResponse(ServiceStatus.SpecificItemFound, savingsBankAccount);
  }

  //
  // Get a list of matching savings bank accounts to the search criteria specified.
  //
  async searchSavingsBankAccounts(query: Partial<SavingsBankAccount>): Promise<BizDataResponse<SavingsBankAccount[]>> {
    const matchingSavingsBankAccounts = this.savingsBankAccounts.filter((savingsBankAccount) => {
      return Object.keys(query).every((key) =>
        (savingsBankAccount as any)[key]?.toString().includes((query as any)[key]),
      );
    });

    if (matchingSavingsBankAccounts.length === 0) {
      return new BizDataResponse(ServiceStatus.MatchingItemsNotFound, []);
    }

    return new BizDataResponse(ServiceStatus.MatchingItemsFound, matchingSavingsBankAccounts);
  }

  //
  // Delete an existing savings bank account whose ID is provided.
  //
  async deleteSavingsBankAccount(id: number): Promise<BizResponse> {
    const index = this.savingsBankAccounts.findIndex(c => c.id === +id);
    
    if (index === -1) {
      return new BizResponse(ServiceStatus.SpecificItemNotFound);
    }

    this.savingsBankAccounts.splice(index, 1);

    return new BizResponse(ServiceStatus.Deleted);
  }
}