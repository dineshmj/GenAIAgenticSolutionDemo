import { BizDataResponse } from "src/models/BizDataResponse";
import { BizResponse } from "src/models/BizResponse";
import { HomeLoan } from "@models/HomeLoan";

export interface IHomeLoanService {
  addHomeLoan(newHomeLoan: HomeLoan): Promise<BizDataResponse<HomeLoan>>;
  modifyHomeLoan(homeLoan: HomeLoan): Promise<BizResponse>;
  getHomeLoanById(id: number): Promise<BizDataResponse<HomeLoan>>;
  searchHomeLoans(query: Partial<HomeLoan>): Promise<BizDataResponse<HomeLoan[]>>;
  deleteHomeLoan(id: number): Promise<BizResponse>;
}