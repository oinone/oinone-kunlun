<script lang="ts">
import { DslDefinition } from '@kunlun/dsl';
import { CastHelper, CSSStyle, StringHelper } from '@kunlun/shared';
import {
  FlexColMode,
  FlexDirection,
  OioCol,
  OioColModel,
  OioColProps,
  PropRecordHelper,
  StyleHelper
} from '@kunlun/vue-ui-antd';
import { onAllMounted } from '@kunlun/vue-widget';
import { createVNode, defineComponent, PropType, vShow, withDirectives } from 'vue';
import { useInjectOioDefaultRowContext, useProviderOioDefaultRowContext } from './context';

export default defineComponent({
  name: 'DefaultCol',
  components: {
    OioCol
  },
  inheritAttrs: false,
  props: {
    ...OioColProps,
    template: {
      type: Object as PropType<DslDefinition>
    },
    invisible: {
      type: Boolean,
      default: false
    },
    allMounted: {
      type: Function
    },
    mode: {
      type: [String, Object] as PropType<FlexColMode>
    },
    width: {
      type: [String, Number]
    },
    minWidth: {
      type: [String, Number]
    },
    maxWidth: {
      type: [String, Number]
    }
  },
  setup(props) {
    const { flexDirection: rowFlexDirection, wrap: rowWrap } = useInjectOioDefaultRowContext();

    onAllMounted({
      allMounted: () => {
        props.allMounted?.();
      },
      allMountedUpdate: () => {
        props.allMounted?.();
      }
    });

    useProviderOioDefaultRowContext({});

    return {
      rowFlexDirection,
      rowWrap
    };
  },
  render() {
    const { $attrs, $slots, template, mode, invisible, rowFlexDirection, rowWrap } = this;
    const classList: string[] = [];
    if (mode === FlexColMode.FULL) {
      classList.push('default-col-full');
    } else if (rowFlexDirection === FlexDirection.Column) {
      classList.push('default-col-flex-auto');
    } else if (mode === FlexColMode.AUTO && !rowWrap) {
      classList.push('default-col-max-width-unset');
    }
    let colProps = {
      ...PropRecordHelper.convert(OioColProps, CastHelper.cast(this)),
      ...PropRecordHelper.collectionBasicProps(
        $attrs,
        StringHelper.append(classList, CastHelper.cast(template?.class)),
        CastHelper.cast(template?.style)
      )
    } as OioColModel & Record<string, unknown>;
    if ((mode && [FlexColMode.FULL, FlexColMode.AUTO].includes(mode)) || rowFlexDirection === FlexDirection.Column) {
      colProps = {
        ...colProps,
        fixed: false
      };
      delete colProps.span;
    } else {
      colProps = {
        ...colProps,
        fixed: true
      };
      delete colProps.flex;
    }
    const width = StyleHelper.px(this.width);
    const minWidth = StyleHelper.px(this.minWidth);
    const maxWidth = StyleHelper.px(this.maxWidth);
    if (width || minWidth || maxWidth) {
      const style = {} as CSSStyle;
      if (width) {
        style.minWidth = width;
        style.maxWidth = width;
      }
      if (minWidth) {
        style.minWidth = minWidth;
      }
      if (maxWidth) {
        style.maxWidth = maxWidth;
      }
      colProps.style = style;
    }
    return withDirectives(
      createVNode(OioCol, colProps, PropRecordHelper.collectionSlots($slots, [{ origin: 'default', isNotNull: true }])),
      [[vShow, !invisible]]
    );
  }
});
</script>
