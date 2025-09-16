import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { ListModelApi } from '../service';
import { PamirsEmployee } from '../typing';

export type PamirsEmployeeService = ListModelApi<PamirsEmployee>;

export const PamirsEmployeeMetadata = {
  MODEL_MODEL: 'business.PamirsEmployee',
  MODEL_NAME: 'pamirsEmployee'
};

export const PamirsEmployeeServiceToken = ServiceIdentifier<PamirsEmployeeService>('PamirsEmployeeService');
