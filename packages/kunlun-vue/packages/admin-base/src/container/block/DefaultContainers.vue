<script lang="ts">
import { CastHelper, type CSSStyle } from '@oinone/kunlun-shared';
import { FlexDirection, FormLayout, OioRow, OioRowProps, PropRecordHelper, useOioFormLayoutContext } from '@oinone/kunlun-vue-ui-antd';
import { onAllMounted } from '@oinone/kunlun-vue-widget';
import { computed, createVNode, defineComponent, type PropType, vShow, withDirectives } from 'vue';
import { useProviderOioDefaultRowContext } from './context';

export default defineComponent({
  name: 'DefaultContainers',
  components: {
    OioRow
  },
  inheritAttrs: false,
  props: {
    ...OioRowProps,
    invisible: {
      type: Boolean,
      default: false
    },
    allMounted: {
      type: Function
    },
    layout: {
      type: [String, Object] as PropType<FormLayout>
    },
    flexDirection: {
      type: String as PropType<FlexDirection>
    },
    showInternalBorder: {
      type: Boolean,
      default: false
    },
    rowGutter: {
      type: String,
      default: ''
    },
    colGutter: { type: String, default: '' },
    borderTop: {
      type: Boolean,
      default: false
    },
    borderLeft: {
      type: Boolean,
      default: false
    },
    borderRight: {
      type: Boolean,
      default: false
    },
    borderBottom: {
      type: Boolean,
      default: false
    },
    borderSize: {
      type: String,
      default: '1px'
    },
    borderColor: {
      type: String,
      default: 'var(--oio-border-color)'
    },
    borderStyle: {
      type: String,
      default: 'solid'
    },
    padding: {
      type: String,
      default: '0'
    },
    paddingTop: {
      type: String,
      default: '0'
    },
    paddingLeft: {
      type: String,
      default: '0'
    },
    paddingBottom: {
      type: String,
      default: '0'
    },
    paddingRight: {
      type: String,
      default: '0'
    },
    margin: {
      type: String,
      default: '0'
    },
    marginTop: {
      type: String,
      default: '0'
    },
    marginLeft: {
      type: String,
      default: '0'
    },
    marginBottom: {
      type: String,
      default: '0'
    },
    marginRight: {
      type: String,
      default: '0'
    }
  },
  setup(props) {
    const style = computed(() => {
      const borderStyle = `${props.borderSize} ${props.borderStyle} ${props.borderColor}`;

      const style: CSSStyle = {
        flexDirection: props.flexDirection || '',
        padding: props.padding,
        margin: props.margin,
        borderTop: props.borderTop ? borderStyle : '',
        borderLeft: props.borderLeft ? borderStyle : '',
        borderRight: props.borderRight ? borderStyle : '',
        borderBottom: props.borderBottom ? borderStyle : '',
        rowGap: props.rowGutter
      } as CSSStyle;

      return style;
    });

    onAllMounted({
      allMounted: () => {
        props.allMounted?.();
      },
      allMountedUpdate: () => {
        props.allMounted?.();
      }
    });

    useOioFormLayoutContext(props);

    useProviderOioDefaultRowContext({
      flexDirection: computed(() => props.flexDirection || FlexDirection.Row),
      wrap: computed(() => props.wrap)
    });

    return {
      style
    };
  },
  render() {
    const { $attrs, $slots, invisible, style } = this;
    return withDirectives(
      createVNode(
        OioRow,
        {
          ...PropRecordHelper.convert(OioRowProps, CastHelper.cast(this)),
          ...PropRecordHelper.collectionBasicProps($attrs, ['default-containers'], style),
          gutter: []
        },
        PropRecordHelper.collectionSlots($slots, [{ origin: 'default', isNotNull: true }])
      ),
      [[vShow, !invisible]]
    );
  }
});
</script>
