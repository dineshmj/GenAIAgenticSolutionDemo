import { Test, TestingModule } from '@nestjs/testing';
import { SavingsBankAccountController } from './bankaccount.controller';
import { ISavingsBankAccountService } from 'src/services/ISavingsBankAccountService';
import { SavingsBankAccount } from '@models/SavingsBankAccount';
import { HttpStatus } from '@nestjs/common';
import { ServiceStatus } from '@models/ServiceStatus';

describe('SavingsBankAccountController', () => {
  let controller: SavingsBankAccountController;
  let service: ISavingsBankAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavingsBankAccountController],
      providers: [
        { provide: 'ISavingsBankAccountService', useValue: {} },  // Mocking ISavingsBankAccountService
      ],
    }).compile();

    controller = module.get<SavingsBankAccountController>(SavingsBankAccountController);
    service = module.get<ISavingsBankAccountService>('ISavingsBankAccountService');
  });

  describe('getMatchingSavingsBankAccounts', () => {
    it('should return a list of matching savings bank accounts', async () => {
      // Mock the ISavingsBankAccountService's searchSavingsBankAccounts method
      const mockSavingsBankAccounts: SavingsBankAccount[] = [
        {
          id: 1,
          customerName: 'John Doe',
          customerId: 123456,
          depositAmount: 1000,
          branchCode: "syd001",
          location: "Sydney"
        },
        {
          id: 1,
          customerName: 'Sarah Smith',
          customerId: 234567,
          depositAmount: 5000,
          branchCode: "syd007",
          location: "Sydney"
        },
      ];

      jest
        .spyOn(service, 'searchSavingsBankAccounts')
        .mockResolvedValue({
          status: ServiceStatus.MatchingItemsFound,
          data: mockSavingsBankAccounts,
          validationFailures:null,
          isValid() {
              return true;
          },
        });

      const query = { customerName: 'John Doe' };
      const result = await controller.getMatchingSavingsBankAccounts(query);

      expect(result).toEqual(mockSavingsBankAccounts);
      expect((result as any).status).toBe(HttpStatus.OK);
    });

    it('should return an empty list if no matching savings bank accounts', async () => {
      jest
        .spyOn(service, 'searchSavingsBankAccounts')
        .mockResolvedValue({
          status: ServiceStatus.MatchingItemsNotFound,
          data: [],
          validationFailures:null,
          isValid() {
              return true;
          },
        });

      const query = { customerName: 'John Doe' };
      const result = await controller.getMatchingSavingsBankAccounts(query);

      expect(result).toEqual([]);
      expect((result as any).status).toBe(HttpStatus.OK);
    });
  });
});