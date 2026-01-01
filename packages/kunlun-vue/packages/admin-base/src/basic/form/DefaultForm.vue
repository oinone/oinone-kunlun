<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import { OioForm, type OioFormInstance } from '@oinone/kunlun-vue-ui-antd';
import { OioFormProps, PropRecordHelper, useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from '@oinone/kunlun-vue-ui-common';
import type { DslRenderDefinition } from '@oinone/kunlun-vue-widget';
import { createVNode, defineComponent, onMounted, type PropType, ref } from 'vue';
import { defaultFlexResolve } from '../../tags/resolve/helper';
import { FormBizStyle } from '../../typing';
import { ManualWidget } from '../mixin';

export default defineComponent({
  name: 'DefaultForm',
  mixins: [ManualWidget],
  components: {
    OioForm
  },
  inheritAttrs: false,
  props: {
    ...OioFormProps,
    template: {
      type: Object as PropType<DslRenderDefinition>
    },
    setFormInstance: {
      type: Function as PropType<(instance: OioFormInstance | undefined) => void>
    },
    formData: {
      type: Object,
      default: () => {}
    },
    bizStyle: {
      type: String as PropType<FormBizStyle>
    }
  },
  setup(props) {
    const origin = ref<HTMLElement>();
    const formRef = ref<OioFormInstance>();
    const formContext = useInjectOioDefaultFormContext();

    useProviderOioDefaultFormContext({
      ...formContext,
      getTriggerContainer: (triggerNode) => {
        if (formContext.getTriggerContainer) {
          return formContext.getTriggerContainer(triggerNode);
        }
        if (origin.value) {
          return origin.value;
        }
        return triggerNode.parentNode || document.body;
      }
    });

    onMounted(() => {
      props.setFormInstance?.(formRef.value);
    });

    return {
      origin,
      formRef
    };
  },
  render() {
    const { template, bizStyle } = this;
    const { default: defaultSlot } = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      }
    ]);
    const defaultChildren = defaultFlexResolve(template, defaultSlot);

    const classNames = [`${DEFAULT_PREFIX}-default-form`];
    if (bizStyle === FormBizStyle.WORD) {
      classNames.push(`${DEFAULT_PREFIX}-default-word-form`);
    }

    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps(this.$attrs, classNames),
        ref: 'origin'
      },
      [
        createVNode(
          OioForm,
          {
            ...PropRecordHelper.convert(OioFormProps, CastHelper.cast(this)),
            ref: 'formRef',
            wrapperClassName: StringHelper.append(
              [`${DEFAULT_PREFIX}-default-form-wrapper`],
              this.wrapperClassName
            ).join(' ')
          },
          {
            default: () => defaultChildren
          }
        )
      ]
    );
  }
});
</script>
