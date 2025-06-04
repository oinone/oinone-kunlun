import { UrlSegmentGroup } from '@oinone/kunlun-router';
import { genToken } from '@oinone/kunlun-vue-widget';
import { computed, ComputedRef, inject, provide } from 'vue';
import { ACTIVATED_ROUTE_TOKEN } from '../token';

export const PARENT_SEGMENT_GROUP_TOKEN = genToken<ComputedRef<UrlSegmentGroup | undefined>>('parent_segment_group');

export const useSegmentGroup = (namespace?: string) => {
  const activatedRoute = inject(ACTIVATED_ROUTE_TOKEN)!;
  const parentSegmentGroup = inject(
    PARENT_SEGMENT_GROUP_TOKEN,
    computed(() => activatedRoute.value.root)
  );

  const currentSegmentGroupRef = computed(() => {
    if (!parentSegmentGroup?.value) {
      return;
    }
    const { children } = parentSegmentGroup.value;
    return namespace ? children[namespace] : children.primary;
  });

  if (namespace) {
    provide(PARENT_SEGMENT_GROUP_TOKEN, currentSegmentGroupRef);
  }

  // 如果没有 children 的话 SegmentGroup 信息会在当前 group 下
  // 如果有 children，SegmentGroup 信息会被移到 children.primary 下
  const currentSegmentGroup = computed(() => {
    if (!currentSegmentGroupRef.value) {
      return;
    }
    const { children } = currentSegmentGroupRef.value;
    return Object.keys(children).length ? children.primary : currentSegmentGroupRef.value;
  });

  return { currentSegmentGroup };
};
