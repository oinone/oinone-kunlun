import { SPI } from '@oinone/kunlun-spi';
import { AbstractListModelApi, GenericFunctionService } from '../../service';
import type { PamirsEmployee } from '../../typing';
import {
  PamirsEmployeeMetadata,
  type PamirsEmployeeQueryFilter,
  type PamirsEmployeeService,
  PamirsEmployeeServiceToken
} from '../PamirsEmployeeService';

@SPI.Service(PamirsEmployeeServiceToken)
export class PamirsEmployeeServiceImpl extends AbstractListModelApi<PamirsEmployee> implements PamirsEmployeeService {
  protected get modelModel() {
    return PamirsEmployeeMetadata.MODEL_MODEL;
  }

  public async queryListByFilter(query: PamirsEmployeeQueryFilter): Promise<PamirsEmployee[]> {
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
