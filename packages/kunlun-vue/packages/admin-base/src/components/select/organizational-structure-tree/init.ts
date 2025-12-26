import {
  PamirsDepartment,
  PamirsOrganizationalStructure,
  PamirsOrganizationalStructureServiceToken
} from '@oinone/kunlun-engine';
import { OioTreeNode } from '@oinone/kunlun-shared';
import { SPI } from '@oinone/kunlun-spi';
import { ComputedRef, type Ref } from 'vue';
import { TreeInitOptions, TreeState, TreeStateLoadFunction, TreeStateProps, useTreeState } from '../../quick-utils';

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
