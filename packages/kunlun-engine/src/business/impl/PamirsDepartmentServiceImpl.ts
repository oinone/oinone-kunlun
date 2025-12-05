import { SPI } from '@oinone/kunlun-spi';
import { AbstractTreeModelApi, GenericFunctionService } from '../../service';
import { PamirsDepartment } from '../../typing';
import {
  DepartmentQueryFilter,
  PamirsDepartmentMetadata,
  PamirsDepartmentService,
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
      (await GenericFunctionService.INSTANCE.simpleExecuteByFun(this.modelModel, 'queryListByFilter', query)) || []
    );
  }
}
