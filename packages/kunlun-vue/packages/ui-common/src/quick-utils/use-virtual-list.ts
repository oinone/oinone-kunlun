import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue';

export interface VirtualListOptions {
  gap: number;
  itemMinWidth: number;
  itemHeight: number;
  containerHeight: number;
  buffer?: number;
  columns?: number;
}

export function useVirtualList<T>(containerRef: Ref<HTMLElement | null>, data: Ref<T[]>, options: VirtualListOptions) {
  const { gap, itemMinWidth, itemHeight, containerHeight, buffer = 2, columns } = options;

  const scrollTop = ref(0);
  const containerWidth = ref(0);
  const ROW_HEIGHT = itemHeight + gap;

  const updateContainerSize = () => {
    if (containerRef.value) {
      containerWidth.value = containerRef.value.clientWidth;
    }
  };

  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(updateContainerSize);
      resizeObserver.observe(containerRef.value);
      updateContainerSize();
    }
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  const onScroll = (e: Event) => {
    scrollTop.value = (e.target as HTMLElement).scrollTop;
  };

  const columnCount = computed(() => {
    if (columns) return columns;
    if (!containerWidth.value) return 1;
    return Math.max(1, Math.floor((containerWidth.value + gap) / (itemMinWidth + gap)));
  });

  const totalRows = computed(() => Math.ceil(data.value.length / columnCount.value));
  const totalHeight = computed(() => totalRows.value * ROW_HEIGHT - gap);

  const visibleRange = computed(() => {
    const startRow = Math.floor(scrollTop.value / ROW_HEIGHT);
    const visibleRowCount = Math.ceil(containerHeight / ROW_HEIGHT);
    const renderStartRow = Math.max(0, startRow - buffer);
    const renderEndRow = Math.min(totalRows.value, startRow + visibleRowCount + buffer);

    return {
      start: renderStartRow * columnCount.value,
      end: renderEndRow * columnCount.value,
      topOffset: renderStartRow * ROW_HEIGHT
    };
  });

  const visibleData = computed(() => {
    const { start, end } = visibleRange.value;
    return data.value.slice(start, end);
  });

  return {
    onScroll,
    totalHeight,
    visibleRange,
    visibleData,
    topOffset: computed(() => visibleRange.value.topOffset)
  };
}
