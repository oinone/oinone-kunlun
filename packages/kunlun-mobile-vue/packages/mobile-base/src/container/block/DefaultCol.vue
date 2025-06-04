<script lang="ts">
import { DslDefinition } from '@oinone/kunlun-dsl';
import { CastHelper, CSSStyle, StringHelper } from '@oinone/kunlun-shared';
import {
  DEFAULT_COLS,
  FlexColMode,
  FlexDirection,
  OioCol,
  OioColModel,
  OioColProps,
  PropRecordHelper,
  StyleHelper
} from '@oinone/kunlun-vue-ui-mobile-vant';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { createVNode, defineComponent, PropType, vShow, withDirectives } from 'vue';
import { useInjectOioDefaultRowContext, useProviderOioDefaultRowContext } from './context';
import { ViewType } from '@oinone/kunlun-meta';

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
    },
    viewType: {
      type: String as PropType<ViewType>
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
    const { $attrs, $slots, template, mode, invisible, rowFlexDirection, rowWrap, span, viewType } = this;
    const classList: string[] = [];
    if (mode === FlexColMode.FULL) {
      classList.push('mobile-default-col-full');
    } else if (rowFlexDirection === FlexDirection.Column) {
      classList.push('mobile-default-col-flex-auto');
    } else if (mode === FlexColMode.AUTO && !rowWrap) {
      classList.push('mobile-default-col-max-width-unset');
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
    // 移动端强制占满整行
    colProps.span = viewType === ViewType.Gallery ? span : DEFAULT_COLS;
    return withDirectives(
      createVNode(OioCol, colProps, PropRecordHelper.collectionSlots($slots, [{ origin: 'default', isNotNull: true }])),
      [[vShow, !invisible]]
    );
  }
});
</script>
