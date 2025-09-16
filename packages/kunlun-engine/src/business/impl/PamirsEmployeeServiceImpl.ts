import { OioListItem, uniqueKeyGenerator } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { AbstractModelApi } from '../../service';
import { PamirsEmployee } from '../../typing';
import { PamirsEmployeeMetadata, PamirsEmployeeService, PamirsEmployeeServiceToken } from '../PamirsEmployeeService';

@SPI.Service(PamirsEmployeeServiceToken)
export class PamirsEmployeeServiceImpl extends AbstractModelApi<PamirsEmployee> implements PamirsEmployeeService {
  protected get modelModel() {
    return PamirsEmployeeMetadata.MODEL_MODEL;
  }

  public convertListData(
    list: PamirsEmployee[],
    options?: {
      computeTitle?: () => string;
    }
  ): OioListItem<PamirsEmployee>[] {
    const computeTitle =
      options?.computeTitle ||
      ((data: PamirsEmployee) => {
        return data.name || data.code || data.id || uniqueKeyGenerator();
      });
    return list.map((v) => {
      const key = v.code!;
      const option: OioListItem<PamirsEmployee> = {
        key,
        value: key,
        label: computeTitle(v),
        data: v
      };
      return option;
    });
  }
}
