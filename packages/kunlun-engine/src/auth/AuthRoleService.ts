import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { ListModelApi } from '../service';
import { AuthRole } from '../typing';

export type AuthRoleService = ListModelApi<AuthRole>;

export const AuthRoleMetadata = {
  MODEL_MODEL: 'auth.AuthRole',
  MODEL_NAME: 'authRole'
};

export const AuthRoleServiceToken = ServiceIdentifier<AuthRoleService>('AuthRoleService');
