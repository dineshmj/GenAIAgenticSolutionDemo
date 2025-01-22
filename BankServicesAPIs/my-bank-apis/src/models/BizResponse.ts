import '../Helpers/ListExtensions'
import { BizValidationFailure } from "./BizValidationFailure";
import { ServiceStatus } from "./ServiceStatus";

//
// Used as return type of Service methods, where there is no data returned. Examples: the Modify Existing method
// or the Delete Existing method. It can also convey the service status from the Enum, and if there are any 
// business validation failures, you can get that too.
//
export class BizResponse {
    public readonly status: ServiceStatus;
    public readonly validationFailures: BizValidationFailure[];

    // Tells if the returned response is all good.
    public isValid(): boolean {
      return !this.validationFailures || this.validationFailures?.length === 0;
    }

    // Constructor
    constructor(value: ServiceStatus | BizValidationFailure[]) {
      if (typeof value === 'number' && Object.values(ServiceStatus).includes(value)) {
        // Service status enum is the signature.
        var specifiedStatus = value as ServiceStatus;

        if (specifiedStatus === ServiceStatus.BizValidationFailure) {
          throw new Error ("You cannot set Business Validation Status directly.");
        }

        this.status = specifiedStatus;
      } else if (Array.isArray(value)) {
        // A list of Business Valdiation Failures is the signature.
        if (value.isNullOrEmpty () || ! value.every(item => item instanceof BizValidationFailure)) {
          throw new Error ("There should be at least one Business Validation failure in the list.");
        }

        this.validationFailures = value as BizValidationFailure [];
        this.status = ServiceStatus.BizValidationFailure;
      }
    };
  }

export { ServiceStatus };
