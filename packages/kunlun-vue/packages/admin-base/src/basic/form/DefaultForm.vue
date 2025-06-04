<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { DEFAULT_PREFIX } from '@oinone/kunlun-theme';
import { OioForm, OioFormInstance } from '@oinone/kunlun-vue-ui-antd';
import { OioFormProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { DslRenderDefinition } from '@oinone/kunlun-vue-widget';
import { createVNode, defineComponent, onMounted, PropType, ref } from 'vue';
import { defaultFlexResolve } from '../../tags/resolve/helper';
import { ManualWidget } from '../mixin';
import { useInjectOioDefaultFormContext, useProviderOioDefaultFormContext } from './context';

export default defineComponent({
  name: 'DefaultForm',
  mixins: [ManualWidget],
  components: {
    OioForm
  },
  inheritAttrs: false,
  slots: ['default'],
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
    const { template } = this;
    const { default: defaultSlot } = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      }
    ]);
    const defaultChildren = defaultFlexResolve(template, defaultSlot);
    return createVNode(
      'div',
      {
        ...PropRecordHelper.collectionBasicProps(
          this.$attrs,
          StringHelper.append([`${DEFAULT_PREFIX}-default-form`], CastHelper.cast(this.template?.class)),
          CastHelper.cast(this.template?.style)
        ),
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
