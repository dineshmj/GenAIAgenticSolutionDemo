export class BizValidationFailure {
  constructor(public property: string, public validationFailureMessage: string) {}
}