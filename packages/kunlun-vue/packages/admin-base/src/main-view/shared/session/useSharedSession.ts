/**
 * 分享会话
 */
export interface SharedSession {
  /**
   * 分享码
   */
  sharedCode: string;
  /**
   * 授权码
   */
  authorizationCode?: string;
  /**
   * 页面参数
   */
  page?: Record<string, unknown>;
}

let activeSharedSession: SharedSession | undefined;

export function setSharedSession(sharedSession: SharedSession | undefined): void {
  activeSharedSession = sharedSession;
}

export function getSharedSession(): SharedSession | undefined {
  return activeSharedSession;
}

export function clearSharedSession() {
  activeSharedSession = undefined;
}
