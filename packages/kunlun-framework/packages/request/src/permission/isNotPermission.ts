import { getErrorCode } from '../exception';
import { notPermissionCodes } from './system-error-code';

/**
 * predict exception permission
 * @param e {@link Error}
 */
export function isNotPermission(e: Error | unknown): boolean {
  return isNotPermission0(e, notPermissionCodes);
}

/**
 * predict exception permission
 * @param e {@link Error}
 * @param permissionCodes specify permission codes.
 */
function isNotPermission0(e: Error | unknown, permissionCodes: string[]): boolean {
  const errorCode = getErrorCode(e);
  if (!errorCode) {
    return false;
  }
  return permissionCodes.includes(errorCode);
}
