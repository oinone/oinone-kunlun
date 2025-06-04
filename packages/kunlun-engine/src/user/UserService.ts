import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { UserInfo } from '../typing';

export interface UserService {
  getUserInfo(): Promise<UserInfo | undefined>;
}

/**
 * 用户服务Token
 */
export const UserServiceToken = ServiceIdentifier<UserService>('UserService');
