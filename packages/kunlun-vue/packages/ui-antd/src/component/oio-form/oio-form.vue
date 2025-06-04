<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import {
  NamePath,
  OioFormInstance,
  OioFormProps,
  PropRecordHelper,
  useOioFormLayoutContext
} from '@oinone/kunlun-vue-ui-common';
import { Form as AForm, FormInstance as AFormInstance } from 'ant-design-vue';
import { isNil } from 'lodash-es';
import { createVNode, defineComponent, ref, VNode } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioSpin } from '../oio-spin';

export default defineComponent({
  name: 'OioForm',
  components: {
    AForm,
    OioSpin
  },
  inheritAttrs: false,
  props: {
    ...OioFormProps
  },
  setup(props, context) {
    useOioFormLayoutContext(props);

    const origin = ref<AFormInstance>();

    const instance: OioFormInstance<AFormInstance> = {
      getOrigin(): AFormInstance {
        return origin.value!;
      },
      resetFields: async (names?: NamePath) => {
        origin.value!.resetFields(CastHelper.cast(names));
      },
      clearValidate: async (names?: NamePath) => {
        origin.value!.clearValidate(CastHelper.cast(names));
      },
      validate: async (names?: NamePath) => {
        return origin.value!.validate(CastHelper.cast(names));
      },
      validateFields: async (names?: NamePath) => {
        return origin.value!.validateFields(CastHelper.cast(names));
      },
      scrollToField: async (names?: NamePath) => {
        origin.value!.scrollToField(CastHelper.cast(names));
      }
    };

    context.expose(instance);

    return {
      origin
    };
  },
  render() {
    const formComponent: VNode = createVNode(
      AForm,
      {
        name: this.name,
        rules: this.rules,
        layout: this.layout,
        labelCol: this.labelCol,
        wrapperCol: this.wrapperCol,
        labelAlign: this.labelAlign,
        colon: this.colon,
        validateTrigger: this.validateTrigger,
        validateOnRuleChange: this.validateOnRuleChange,
        ...this.$attrs,
        model: this.data,
        class: StringHelper.append([`${DEFAULT_PREFIX}-form`], CastHelper.cast(this.$attrs.class)),
        ref: 'origin'
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        {
          origin: 'default',
          isNotNull: true
        }
      ])
    );
    if (isNil(this.loading)) {
      return formComponent;
    }
    return createVNode(
      OioSpin,
      {
        loading: this.loading,
        loadingIndicator: this.loadingIndicator,
        wrapperClassName: StringHelper.append(
          [`${DEFAULT_PREFIX}-form-wrapper`],
          CastHelper.cast(this.wrapperClassName)
        ).join(' ')
      },
      {
        default: () => [formComponent]
      }
    );
  }
});
</script>
