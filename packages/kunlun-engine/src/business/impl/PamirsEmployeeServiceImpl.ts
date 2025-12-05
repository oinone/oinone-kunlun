import { SPI } from '@oinone/kunlun-spi';
import { AbstractListModelApi, GenericFunctionService } from '../../service';
import { PamirsEmployee } from '../../typing';
import {
  PamirsEmployeeMetadata,
  PamirsEmployeeQueryFilter,
  PamirsEmployeeService,
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
      (await GenericFunctionService.INSTANCE.simpleExecuteByFun(this.modelModel, 'queryListByFilter', query)) || []
    );
  }
}
