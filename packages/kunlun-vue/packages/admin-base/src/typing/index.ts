import { NumberHelper } from '@kunlun/shared';
import { PageSizeEnum, PopconfirmPlacement } from '@kunlun/vue-ui-common';
import { isNil } from 'lodash-es';

export const DEFAULT_PAGE_SIZE = 15;

export function fetchPageSizeNullable(pageSize: string | number | null | undefined): number | undefined {
  let realPageSize;
  if (pageSize) {
    realPageSize = NumberHelper.toNumber(pageSize);
    if (isNil(realPageSize)) {
      return PageSizeEnum[pageSize];
    }
  }
  return realPageSize;
}

export function fetchPageSize(pageSize: string | number | null | undefined): number {
  return fetchPageSizeNullable(pageSize) || PageSizeEnum.OPTION_2;
}

export function fetchPopconfirmPlacement(placement: string | undefined): PopconfirmPlacement | undefined {
  let realPlacement;
  if (placement) {
    const placementEnumValue = PopconfirmPlacement[placement];
    if (placementEnumValue) {
      realPlacement = placementEnumValue;
    } else {
      realPlacement = placement;
    }
  }
  return realPlacement;
}

export * from './action';
export * from './active-count';
export * from './card-cascader';
export * from './copyright';
export * from './model';
export * from './operation-column';
export * from './popup';
export * from './tree';
export * from './typing';
export * from './user-prefer';
export * from './validator';
export * from './widget-names';
