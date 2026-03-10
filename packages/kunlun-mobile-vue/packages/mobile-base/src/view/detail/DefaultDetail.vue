<script lang="ts">
import { CastHelper, StringHelper } from '@oinone/kunlun-shared';
import { OioFormProps, PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';
import type { DslRenderDefinition } from '@oinone/kunlun-vue-widget';
import { createVNode, defineComponent, type PropType } from 'vue';
import { DefaultForm, ManualWidget } from '../../basic';
import { DEFAULT_VIEW_CLASS } from '../../ui/theme';

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
    inline: {
      type: Boolean,
      default: undefined
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
        ...PropRecordHelper.collectionBasicProps(this.$attrs, [`${DEFAULT_PREFIX}-default-detail`, DEFAULT_VIEW_CLASS]),
        wrapperClassName: StringHelper.append([`${DEFAULT_PREFIX}-default-detail-wrapper`], this.wrapperClassName).join(
          ' '
        ),
        template: this.template,
        inline: this.inline,
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
