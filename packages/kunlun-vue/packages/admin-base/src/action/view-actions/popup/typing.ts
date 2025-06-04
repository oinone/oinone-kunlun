import { ActiveRecord } from '@oinone/kunlun-engine';

export interface PopupLoadDataResult {
  data: ActiveRecord[];
  isFetchData: boolean;
}
