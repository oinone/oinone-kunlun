import { ServiceIdentifier } from '@oinone/kunlun-spi';
import type { TreeModelApi } from '../service';
import type { PamirsCompany } from '../typing';

export type PamirsCompanyService = TreeModelApi<PamirsCompany>;

export const PamirsCompanyMetadata = {
  MODEL_MODEL: 'business.PamirsCompany',
  MODEL_NAME: 'pamirsDepartment'
};

export const PamirsCompanyServiceToken = ServiceIdentifier<PamirsCompanyService>('PamirsCompanyService');
