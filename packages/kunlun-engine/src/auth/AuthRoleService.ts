import { OioListItem } from '@oinone/kunlun-shared';
import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { ModelApi } from '../service';
import { AuthRole } from '../typing';

export interface AuthRoleService extends ModelApi<AuthRole> {
  convertListData(list: AuthRole[]): OioListItem<AuthRole>[];
}

export const AuthRoleMetadata = {
  MODEL_MODEL: 'auth.AuthRole',
  MODEL_NAME: 'authRole'
};

export const AuthRoleToken = ServiceIdentifier<AuthRoleService>('AuthRoleService');
