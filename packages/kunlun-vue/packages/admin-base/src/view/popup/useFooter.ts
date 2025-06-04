import { translateValueByKey } from '@oinone/kunlun-engine';
import { OioButton } from '@oinone/kunlun-vue-ui-antd';
import { createVNode, PropType, VNode } from 'vue';

export const FooterProps = {
  okText: {
    type: String
  },
  okInvisible: {
    type: Boolean,
    default: undefined
  },
  onOk: {
    type: Function as PropType<(data) => void>
  },
  cancelText: {
    type: String
  },
  cancelInvisible: {
    type: Boolean,
    default: undefined
  },
  onCancel: {
    type: Function as PropType<(data) => void>
  },
  actionLoading: {
    type: Boolean,
    default: undefined
  },
  actionReverse: {
    type: Boolean,
    default: undefined
  },
  translate: {
    type: Function // as PropType<(key: string) => string>
  }
};

type FooterOptions = {
  [K in keyof typeof FooterProps]: typeof FooterProps[K]['type'] | null | undefined;
};

function createOkButton(props: FooterOptions) {
  return createVNode(
    OioButton,
    {
      type: 'primary',
      loading: props.actionLoading,
      onClick: props.onOk
    },
    {
      default: () => translateValueByKey(props.okText as unknown as string)
    }
  );
}

function createCancelButton(props: FooterOptions) {
  return createVNode(
    OioButton,
    {
      onClick: props.onCancel
    },
    {
      default: () => translateValueByKey(props.cancelText as unknown as string)
    }
  );
}

export function useFooter(props: FooterOptions): VNode[] {
  const buttons: VNode[] = [];
  if (!props.cancelInvisible) {
    buttons.push(createCancelButton(props));
  }
  if (!props.okInvisible) {
    buttons.push(createOkButton(props));
  }
  if (props.actionReverse) {
    return buttons.reverse();
  }
  return buttons;
}
