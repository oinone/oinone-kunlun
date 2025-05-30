export enum ValidatorStatus {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Validating = 'validating',
  Skip = 'skip'
}

export interface ValidatorInfo {
  message?: string;
  status?: ValidatorStatus;
  path: string;
  displayName?: string;
  children?: ValidatorInfo[];
}

export function isValidatorSuccess(info: ValidatorInfo): boolean {
  return info.status === ValidatorStatus.Success;
}

export function isValidatorLikeSuccess(info: ValidatorInfo): boolean {
  return info.status === ValidatorStatus.Success || info.status === ValidatorStatus.Skip;
}

export function isValidatorError(info: ValidatorInfo): boolean {
  return info.status === ValidatorStatus.Error;
}

export function isValidatorWarning(info: ValidatorInfo): boolean {
  return info.status === ValidatorStatus.Warning;
}

export function isValidatorValidating(info: ValidatorInfo): boolean {
  return info.status === ValidatorStatus.Validating;
}

export function isValidatorSkip(info: ValidatorInfo): boolean {
  return info.status === ValidatorStatus.Skip;
}
