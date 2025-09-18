import { SPI } from '@oinone/kunlun-spi';
import { AbstractListModelApi } from '../../service';
import { PamirsEmployee } from '../../typing';
import { PamirsEmployeeMetadata, PamirsEmployeeService, PamirsEmployeeServiceToken } from '../PamirsEmployeeService';

@SPI.Service(PamirsEmployeeServiceToken)
export class PamirsEmployeeServiceImpl extends AbstractListModelApi<PamirsEmployee> implements PamirsEmployeeService {
  protected get modelModel() {
    return PamirsEmployeeMetadata.MODEL_MODEL;
  }
}
