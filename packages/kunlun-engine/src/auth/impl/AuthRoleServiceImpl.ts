import { SPI } from '@oinone/kunlun-spi';
import { AbstractListModelApi } from '../../service';
import { AuthRole } from '../../typing';
import { AuthRoleMetadata, AuthRoleService, AuthRoleServiceToken } from '../AuthRoleService';

@SPI.Service(AuthRoleServiceToken)
export class AuthRoleServiceImpl extends AbstractListModelApi<AuthRole> implements AuthRoleService {
  protected get modelModel() {
    return AuthRoleMetadata.MODEL_MODEL;
  }
}
