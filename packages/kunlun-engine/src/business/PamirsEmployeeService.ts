import { OioListItem } from '@oinone/kunlun-shared';
import { ServiceIdentifier } from '@oinone/kunlun-spi';
import { ModelApi } from '../service';
import { PamirsEmployee } from '../typing';

export interface PamirsEmployeeService extends ModelApi<PamirsEmployee> {
  convertListData(list: PamirsEmployee[]): OioListItem<PamirsEmployee>[];
}

export const PamirsEmployeeMetadata = {
  MODEL_MODEL: 'business.PamirsEmployee',
  MODEL_NAME: 'pamirsEmployee'
};

export const PamirsEmployeeToken = ServiceIdentifier<PamirsEmployeeService>('PamirsEmployeeService');
