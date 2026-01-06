import { SPI } from '@oinone/kunlun-spi';
import { AbstractTreeModelApi, GenericFunctionService } from '../../service';
import type { PamirsDepartment } from '../../typing';
import {
  type DepartmentQueryFilter,
  PamirsDepartmentMetadata,
  type PamirsDepartmentService,
  PamirsDepartmentServiceToken
} from '../PamirsDepartmentService';

@SPI.Service(PamirsDepartmentServiceToken)
export class PamirsDepartmentServiceImpl
  extends AbstractTreeModelApi<PamirsDepartment>
  implements PamirsDepartmentService
{
  protected get modelModel() {
    return PamirsDepartmentMetadata.MODEL_MODEL;
  }

  public async queryListByFilter(query: DepartmentQueryFilter): Promise<PamirsDepartment[]> {
    // fixme @zbh 20251205 optimize request
    return (
      (await GenericFunctionService.INSTANCE.simpleExecuteByFun(
        query.model || this.modelModel,
        'queryListByFilter',
        query
      )) || []
    );
  }
}
