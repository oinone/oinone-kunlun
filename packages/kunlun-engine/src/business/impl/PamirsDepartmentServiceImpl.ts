import { SPI } from '@oinone/kunlun-spi';
import { AbstractTreeModelApi } from '../../service';
import { PamirsDepartment } from '../../typing';
import {
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
}
