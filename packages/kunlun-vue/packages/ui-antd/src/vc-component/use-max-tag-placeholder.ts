import { Popover as APopover } from 'ant-design-vue';
import { createVNode } from 'vue';
import { DEFAULT_PREFIX } from '../theme';

export function useMaxTagPlaceholder() {
  const defaultMaxTagPlaceholder = (values: { label: string }[]) => {
    return createVNode(
      APopover,
      {
        overlayClassName: `${DEFAULT_PREFIX}-select-selection-rest-overlay`,
        placement: 'bottomRight',
        destroyTooltipOnHide: true
      },
      {
        default: () => {
          return `+ ${values.length}`;
        },
        content: () => {
          return values.map((v) => {
            const { label } = v;
            return createVNode(
              'span',
              {
                class: `${DEFAULT_PREFIX}-select-selection-rest-item`,
                title: label
              },
              { default: () => label }
            );
          });
        }
      }
    );
  };

  return {
    defaultMaxTagPlaceholder
  };
}
