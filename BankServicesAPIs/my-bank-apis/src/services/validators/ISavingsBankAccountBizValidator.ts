import { BizValidationFailure } from "src/models/BizValidationFailure";
import { SavingsBankAccount } from "@models/SavingsBankAccount";
import { InstanceState } from "src/models/InstanceState";

export interface ISavingsBankAccountBizValidator {
  validate(savingsBankAccount: Partial<SavingsBankAccount>, state: InstanceState): Promise<BizValidationFailure[]>;
}