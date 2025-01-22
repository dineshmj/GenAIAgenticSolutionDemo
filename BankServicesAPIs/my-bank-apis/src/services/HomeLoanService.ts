import { Injectable, Inject } from '@nestjs/common';
import { BizResponse, ServiceStatus } from '../models/BizResponse';
import { BizDataResponse } from 'src/models/BizDataResponse';
import { InstanceState } from 'src/models/InstanceState';
import { HomeLoan } from '../models/HomeLoan';
import { IHomeLoanBizValidator } from './validators/IHomeLoanBizValidator';
import { IHomeLoanService } from './IHomeLoanService';

@Injectable()
export class HomeLoanService
  implements IHomeLoanService {
  private homeLoans: HomeLoan[] = [
    {
      id: 1,
      customerName: 'Chuck Johns',
      customerId: 1024,
      loanAmount: 12000,
      propertyLocation: 'Sydney',
      loanTenure: 10
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      customerId: 2048,
      loanAmount: 15000,
      propertyLocation: 'Melbourne',
      loanTenure: 8
    },
    {
      id: 3,
      customerName: 'Alice Johnson',
      customerId: 4096,
      loanAmount: 18000,
      propertyLocation: 'Canberra',
      loanTenure: 12
    },
    {
      id: 4,
      customerName: 'Bob Brown',
      customerId: 8192,
      loanAmount: 10000,
      propertyLocation: 'Brisbane',
      loanTenure: 16
    },
  ];

  private nextId = 5;

  constructor(@Inject('IHomeLoanBizValidator') private readonly validator: IHomeLoanBizValidator) {
  }

  //
  // Add new home loan.
  //
  async addHomeLoan(newHomeLoan: HomeLoan): Promise<BizDataResponse<HomeLoan>> {
    // Business validation
    const validationFailures = await this.validator.validate (newHomeLoan, InstanceState.New);

    if (validationFailures.length > 0) {
      return new BizDataResponse(validationFailures, null);
    }

    // Add home loan
    newHomeLoan.id = this.nextId++;
    this.homeLoans.push(newHomeLoan);

    return new BizDataResponse(ServiceStatus.Created, newHomeLoan);
  }

  //
  // Modify existing home loan.
  //
  async modifyHomeLoan(homeLoan: HomeLoan): Promise<BizResponse> {
    // Business validation
    const validationFailures = await this.validator.validate(homeLoan, InstanceState.Existing);

    if (validationFailures.length > 0) {
      return new BizResponse(validationFailures);
    }

    // Find and update the home loan
    const index = this.homeLoans.findIndex((c) => c.id === homeLoan.id);

    if (index === -1) {
      return new BizResponse(ServiceStatus.SpecificItemNotFound);
    }

    this.homeLoans[index] = homeLoan;
    return new BizResponse(ServiceStatus.Modified);
  }

  //
  // Get the specific home loan whose ID is provided.
  //
  async getHomeLoanById(id: number): Promise<BizDataResponse<HomeLoan>> {
    const homeLoan = this.homeLoans.find(c => c.id === +id);

    if (!homeLoan) {
      return new BizDataResponse(
        ServiceStatus.SpecificItemNotFound,
        homeLoan
      );
    }

    return new BizDataResponse(ServiceStatus.SpecificItemFound, homeLoan);
  }

  //
  // Get a list of matching home loans to the search criteria specified.
  //
  async searchHomeLoans(query: Partial<HomeLoan>): Promise<BizDataResponse<HomeLoan[]>> {
    const matchingHomeLoans = this.homeLoans.filter((homeLoan) => {
      return Object.keys(query).every((key) =>
        (homeLoan as any)[key]?.toString().includes((query as any)[key]),
      );
    });

    if (matchingHomeLoans.length === 0) {
      return new BizDataResponse(ServiceStatus.MatchingItemsNotFound, []);
    }

    return new BizDataResponse(ServiceStatus.MatchingItemsFound, matchingHomeLoans);
  }

  //
  // Delete an existing home loan whose ID is provided.
  //
  async deleteHomeLoan(id: number): Promise<BizResponse> {
    const index = this.homeLoans.findIndex(c => c.id === +id);
    
    if (index === -1) {
      return new BizResponse(ServiceStatus.SpecificItemNotFound);
    }

    this.homeLoans.splice(index, 1);

    return new BizResponse(ServiceStatus.Deleted);
  }
}