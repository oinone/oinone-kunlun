<script lang="ts">
import { CastHelper, StringHelper } from '@kunlun/shared';
import { DEFAULT_PREFIX } from '@kunlun/theme';
import { OioFormProps, PropRecordHelper } from '@kunlun/vue-ui-common';
import { DslRenderDefinition } from '@kunlun/vue-widget';
import { createVNode, defineComponent, PropType } from 'vue';
import { DefaultForm, ManualWidget } from '../../basic';

export default defineComponent({
  name: 'DefaultDetail',
  mixins: [ManualWidget],
  components: {
    DefaultForm
  },
  inheritAttrs: false,
  props: {
    ...OioFormProps,
    template: {
      type: Object as PropType<DslRenderDefinition>
    },
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  render() {
    return createVNode(
      DefaultForm,
      {
        ...PropRecordHelper.convert(OioFormProps, CastHelper.cast(this)),
        ...PropRecordHelper.collectionBasicProps(
          this.$attrs,
          StringHelper.append([`${DEFAULT_PREFIX}-default-detail`], CastHelper.cast(this.template?.class)),
          CastHelper.cast(this.template?.style)
        ),
        wrapperClassName: StringHelper.append([`${DEFAULT_PREFIX}-default-detail-wrapper`], this.wrapperClassName).join(
          ' '
        ),
        template: this.template,
        formData: this.formData
      },
      PropRecordHelper.collectionSlots(this.$slots, [
        {
          origin: 'default',
          isNotNull: true
        }
      ])
    );
  }
});
</script>
