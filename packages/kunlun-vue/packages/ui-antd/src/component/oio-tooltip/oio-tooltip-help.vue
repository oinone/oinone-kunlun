<script lang="ts">
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { PropRecordHelper } from '@oinone/kunlun-vue-ui-common';
import { createVNode, defineComponent } from 'vue';
import { DEFAULT_PREFIX } from '../../theme';
import OioTooltip from './oio-tooltip.vue';

export default defineComponent({
  name: 'OioTooltipHelp',
  components: {
    OioTooltip,
    QuestionCircleOutlined
  },
  props: {
    content: {
      type: String,
      required: true
    }
  },
  slots: ['default', 'title'],
  render() {
    const { content } = this;
    return [
      createVNode(
        OioTooltip,
        { class: `${DEFAULT_PREFIX}-tooltip-help`, title: this.$translate(content) },
        PropRecordHelper.collectionSlots(this.$slots, [
          {
            origin: 'default',
            default: () => {
              return [createVNode(QuestionCircleOutlined)];
            }
          },
          'title'
        ])
      )
    ];
  }
});
</script>
