import { OioListItem, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { AbstractModelApi } from '../../service';
import { AuthRole } from '../../typing';
import { AuthRoleMetadata, AuthRoleService, AuthRoleToken } from '../AuthRoleService';

@SPI.Service(AuthRoleToken)
export class AuthRoleServiceImpl extends AbstractModelApi<AuthRole> implements AuthRoleService {
  protected get modelModel() {
    return AuthRoleMetadata.MODEL_MODEL;
  }

  public convertListData(
    list: AuthRole[],
    options?: {
      computeTitle?: () => string;
    }
  ): OioListItem<AuthRole>[] {
    const computeTitle =
      options?.computeTitle ||
      ((data: AuthRole) => {
        return data.name || data.code || data.id || uniqueKeyGenerator();
      });
    return list.map((v) => {
      const key = v.code || v.id || uniqueKeyGenerator();
      const option: OioListItem<AuthRole> = {
        key,
        value: key,
        label: computeTitle(v),
        data: v
      };
      return option;
    });
  }
}
