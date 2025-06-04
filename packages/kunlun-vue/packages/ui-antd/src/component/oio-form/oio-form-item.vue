<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  AFormItemProps,
  FormLayout,
  OioFormItemProps,
  PropRecordHelper,
  useInjectOioFormContext
} from '@oinone/kunlun-vue-ui-common';
import { FormItem as AFormItem } from 'ant-design-vue';
import { computed, createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';

export default defineComponent({
  name: 'OioFormItem',
  components: {
    AFormItem
  },
  inheritAttrs: false,
  props: {
    ...OioFormItemProps
  },
  slots: ['default', 'label', 'extra', 'help'],
  setup(props, context) {
    const origin = ref();
    const formContext = useInjectOioFormContext();

    const vertical = computed(() => {
      let layout = props.layout;
      if (!layout && formContext) {
        layout = formContext.layout.value;
      }
      return layout === FormLayout.vertical;
    });

    // fixme @zbh 打包后 useInjectForm获取的对象与FormItem使用useInjectForm获取的对象不一致，目前使用自定义的OioFormContext进行处理
    // const subFormContext = { ...formContext };
    // subFormContext.vertical = vertical;
    // useProvideForm(subFormContext);

    context.expose({
      isVertical: () => vertical.value,
      onFieldBlur: () => origin.value.onFieldBlur(),
      onFieldChange: () => origin.value.onFieldChange(),
      clearValidate: () => origin.value.clearValidate(),
      resetField: () => origin.value.resetField()
    });

    return {
      origin,
      vertical
    };
  },
  render() {
    const formItemClassList = [`${DEFAULT_PREFIX}-form-item`];
    if (this.vertical) {
      formItemClassList.push(`${DEFAULT_PREFIX}-form-item-vertical`);
    } else {
      formItemClassList.push(`${DEFAULT_PREFIX}-form-item-horizontal`);
    }
    return createVNode(
      AFormItem,
      {
        ...PropRecordHelper.convert(AFormItemProps, CastHelper.cast(this)),
        ...this.$attrs,
        class: StringHelper.append(formItemClassList, CastHelper.cast(this.$attrs.class)),
        ref: 'origin'
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        {
          origin: 'default',
          isNotNull: true
        },
        'label',
        'extra',
        'help'
      ])
    );
  }
});
</script>
