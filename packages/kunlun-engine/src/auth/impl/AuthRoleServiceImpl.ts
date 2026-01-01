import { SPI } from '@oinone/kunlun-spi';
import { AbstractListModelApi, GenericFunctionService } from '../../service';
import type { AuthRole } from '../../typing';
import { AuthRoleMetadata, type AuthRoleQueryFilter, type AuthRoleService, AuthRoleServiceToken } from '../AuthRoleService';

@SPI.Service(AuthRoleServiceToken)
export class AuthRoleServiceImpl extends AbstractListModelApi<AuthRole> implements AuthRoleService {
  protected get modelModel() {
    return AuthRoleMetadata.MODEL_MODEL;
  }

  public async queryListByFilter(query: AuthRoleQueryFilter): Promise<AuthRole[]> {
    // fixme @zbh 20251205 optimize request
    return (
      (await GenericFunctionService.INSTANCE.simpleExecuteByFun(this.modelModel, 'queryListByFilter', query)) || []
    );
  }
}
