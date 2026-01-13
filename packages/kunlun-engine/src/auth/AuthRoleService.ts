import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { ListModelApi } from '../service';
import { AuthRole } from '../typing';

export interface AuthRoleQueryFilter {
  model?: string;
  rsql?: string;
  roleCodes?: string[];
  userRole?: boolean;
}

export interface AuthRoleService extends ListModelApi<AuthRole> {
  queryListByFilter(query: AuthRoleQueryFilter): Promise<AuthRole[]>;
}

export const AuthRoleMetadata = {
  MODEL_MODEL: 'auth.AuthRole',
  MODEL_NAME: 'authRole'
};

export const AuthRoleServiceToken = ServiceIdentifier<AuthRoleService>('AuthRoleService');
