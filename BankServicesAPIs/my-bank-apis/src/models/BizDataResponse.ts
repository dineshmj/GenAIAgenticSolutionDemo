import { BizResponse } from "./BizResponse";
import { BizValidationFailure } from "./BizValidationFailure";
import { ServiceStatus } from "./ServiceStatus";

//
// Used as return type of Service methods, where there is data returned. Examples: the Add New method
// or Search method. Other features supported by the parent class are also available here.
//
export class BizDataResponse<TType> extends BizResponse {
  public data?: TType;

  constructor(value: ServiceStatus | BizValidationFailure[], data: TType) {
    super(value);

    if (this.status != ServiceStatus.BizValidationFailure) {
      this.data = data;
    }
  }
}