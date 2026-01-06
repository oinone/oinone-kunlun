import { type PamirsDepartment, type PamirsOrganizationalStructure, PamirsOrganizationalStructureServiceToken } from '@oinone/kunlun-engine';
import type { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import type { ComputedRef, Ref } from 'vue';
import { type TreeInitOptions, type TreeState, type TreeStateLoadFunction, type TreeStateProps, useTreeState } from '../../quick-utils';

export interface OrganizationalStructureTreeInstance {
  state: Ref<TreeState<PamirsDepartment>>;
  filterData: ComputedRef<OioTreeNode<PamirsOrganizationalStructure>[]>;
  checkedAll: ComputedRef<boolean>;
  halfCheckedAll: ComputedRef<boolean>;

  init(options?: Partial<TreeInitOptions>): Promise<TreeState<PamirsOrganizationalStructure>>;
}

export function useOrganizationalStructureTree(
  props?: TreeStateProps & {
    load?: TreeStateLoadFunction<PamirsOrganizationalStructure>;
  }
) {
  return useTreeState({
    service: SPI.RawInstantiate(PamirsOrganizationalStructureServiceToken)!,
    props,
    load: props?.load
  });
}
