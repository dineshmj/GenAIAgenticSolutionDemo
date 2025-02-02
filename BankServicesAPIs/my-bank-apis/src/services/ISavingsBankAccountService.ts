import { BizDataResponse } from "src/models/BizDataResponse";
import { BizResponse } from "src/models/BizResponse";
import { SavingsBankAccount } from "@models/SavingsBankAccount";

export interface ISavingsBankAccountService {
  addSavingsBankAccount(newSavingsBankAccount: SavingsBankAccount): Promise<BizDataResponse<SavingsBankAccount>>;
  modifySavingsBankAccount(savingsBankAccount: SavingsBankAccount): Promise<BizResponse>;
  getSavingsBankAccountById(id: number): Promise<BizDataResponse<SavingsBankAccount>>;
  searchSavingsBankAccounts(query: Partial<SavingsBankAccount>): Promise<BizDataResponse<SavingsBankAccount[]>>;
  deleteSavingsBankAccount(id: number): Promise<BizResponse>;
}