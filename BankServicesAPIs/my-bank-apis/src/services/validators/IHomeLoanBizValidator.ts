import { BizValidationFailure } from "src/models/BizValidationFailure";
import { HomeLoan } from "@models/HomeLoan";
import { InstanceState } from "src/models/InstanceState";

export interface IHomeLoanBizValidator {
  validate(homeLoan: Partial<HomeLoan>, state: InstanceState): Promise<BizValidationFailure[]>;
}