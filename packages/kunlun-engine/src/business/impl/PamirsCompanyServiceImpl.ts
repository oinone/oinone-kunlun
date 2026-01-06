import { SPI } from '@oinone/kunlun-spi';
import { AbstractTreeModelApi } from '../../service';
import type { PamirsCompany } from '../../typing';
import { PamirsCompanyMetadata, type PamirsCompanyService, PamirsCompanyServiceToken } from '../PamirsCompanyService';

@SPI.Service(PamirsCompanyServiceToken)
export class PamirsCompanyServiceImpl extends AbstractTreeModelApi<PamirsCompany> implements PamirsCompanyService {
  protected get modelModel() {
    return PamirsCompanyMetadata.MODEL_MODEL;
  }
}
