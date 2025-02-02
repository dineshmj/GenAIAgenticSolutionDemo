import { Test, TestingModule } from '@nestjs/testing';
import { HomeLoanController } from './homeloan.controller';
import { IHomeLoanService } from 'src/services/IHomeLoanService';
import { HomeLoan } from '@models/HomeLoan';
import { HttpStatus } from '@nestjs/common';
import { ServiceStatus } from '@models/ServiceStatus';

describe('HomeLoanController', () => {
  let controller: HomeLoanController;
  let service: IHomeLoanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeLoanController],
      providers: [
        { provide: 'IHomeLoanService', useValue: {} },  // Mocking IHomeLoanService
      ],
    }).compile();

    controller = module.get<HomeLoanController>(HomeLoanController);
    service = module.get<IHomeLoanService>('IHomeLoanService');
  });

  describe('getMatchingHomeLoans', () => {
    it('should return a list of matching home loans', async () => {
      // Mock the IHomeLoanService's searchHomeLoans method
      const mockHomeLoans: HomeLoan[] = [
        {
          id: 1,
          customerName: 'John',
          customerId: 'Doe',
          loanAmount: new Date(1990, 5, 15),
          email: 'john.doe@example.com',
          location: '1234567890',
          loanTenure: '123-45-6789', // Added SSN
        },
        {
          id: 2,
          customerName: 'Jane',
          customerId: 'Smith',
          loanAmount: new Date(1985, 8, 25),
          email: 'jane.smith@example.com',
          location: '0987654321',
          loanTenure: '987-65-4321', // Added SSN
        },
      ];

      jest
        .spyOn(service, 'searchHomeLoans')
        .mockResolvedValue({
          status: ServiceStatus.MatchingItemsFound,
          data: mockHomeLoans,
          validationFailures:null,
          isValid() {
              return true;
          },
        });

      const query = { firstName: 'Bob', lastName: 'Smith' };
      const result = await controller.getMatchingHomeLoans(query);

      expect(result).toEqual(mockHomeLoans);
      expect((result as any).status).toBe(HttpStatus.OK);
    });

    it('should return an empty list if no matching home loans', async () => {
      jest
        .spyOn(service, 'searchHomeLoans')
        .mockResolvedValue({
          status: ServiceStatus.MatchingItemsNotFound,
          data: [],
          validationFailures:null,
          isValid() {
              return true;
          },
        });

      const query = { firstName: 'John', lastName: 'Doe' };
      const result = await controller.getMatchingHomeLoans(query);

      expect(result).toEqual([]);
      expect((result as any).status).toBe(HttpStatus.OK);
    });
  });
});