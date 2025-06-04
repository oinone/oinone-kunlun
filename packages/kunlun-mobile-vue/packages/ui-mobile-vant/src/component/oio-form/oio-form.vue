<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioFormProps, PropRecordHelper, useOioFormLayoutContext } from '@oinone/kunlun-vue-ui-common';
import { Form as VanForm } from 'vant';
import { createVNode, defineComponent, ref } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import { OioSpin } from '../oio-spin';

export default defineComponent({
  name: 'OioForm',
  components: {
    VanForm
  },
  inheritAttrs: false,
  props: {
    ...OioFormProps
  },
  setup(props) {
    useOioFormLayoutContext(props);

    const origin = ref();

    // context.expose({
    //   resetFields: (name: NamePath) => origin.value.resetFields(name),
    //   clearValidate: (name: NamePath) => origin.value.clearValidate(name),
    //   validateFields: (nameList?: NamePath[], options?: ValidateOptions) =>
    //     origin.value.validateFields(nameList, options),
    //   getFieldsValue: (nameList: NamePath[] | true = true) => origin.value.getFieldsValue(nameList),
    //   validate: (...args: unknown[]) => origin.value.validate(...args),
    //   scrollToField: (name: NamePath, options = {}) => origin.value.scrollToField(name, options)
    // });

    return {
      origin
    };
  },
  render() {
    return createVNode(
      OioSpin,
      {
        spinning: this.loading,
        indicator: this.loadingIndicator,
        wrapperClassName: StringHelper.append(
          [`${DEFAULT_PREFIX}-form-wrapper`],
          CastHelper.cast(this.wrapperClassName)
        ).join(' ')
      },
      {
        default: () => [
          createVNode(
            VanForm,
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
              ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-form`]),
              model: this.data,
              ref: 'origin'
            },
            PropRecordHelper.collectionSlots(this.$slots, [
              {
                origin: 'default',
                isNotNull: true
              }
            ])
          )
        ]
      }
    );
  }
});
</script>
