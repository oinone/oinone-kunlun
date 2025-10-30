<template>
  <gallery-common-field
    class="gallery-tag-common-item"
    :value="!optionColor ? displayNameListStr : displayNameList.length ? displayNameList : undefined"
    :justify-content="justifyContent"
    :empty-style="emptyStyle"
  >
    <template #default>
      <div v-if="optionColor" class="gallery-tag">
        <template v-for="item in showTags" :key="item">
          <div
            v-if="item.label"
            class="tag"
            :style="{
              color: item.color,
              'background-color': item.backgroundColor
            }"
          >
            <div class="content" :title="item.label">
              {{ item.label }}
            </div>
          </div>
          <div v-else class="tag-blank"></div>
        </template>
        <oio-tooltip v-if="hideTags" placement="tm" :title="hideTags">
          <div
            class="tag"
            :style="{
              width: displayNameList.length > 1 ? '25%' : 'unset'
            }"
          >
            <div class="content hideTags">
              <oio-icon icon="oinone-gengduo1" color="var(--oio-primary-color)" />
            </div>
          </div>
        </oio-tooltip>
      </div>
      <span v-else>{{ displayNameListStr }}</span>
    </template>
  </gallery-common-field>
</template>
<script lang="ts">
import { OioTooltip } from '@oinone/kunlun-vue-ui-antd';
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import { computed, defineComponent, PropType } from 'vue';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
  name: 'GalleryTag',
  inheritAttrs: false,
  components: {
    GalleryCommonField,
    OioTooltip,
    OioIcon
  },
  props: {
    displayNameList: {
      type: Array as PropType<Record<string, string>[]>,
      default: () => []
    },
    justifyContent: {
      type: String
    },
    displayNameListStr: {
      type: String
    },
    emptyStyle: {
      type: String
    },
    optionColor: {
      type: Boolean
    },
    wrap: {
      type: Boolean
    }
  },
  setup(props) {
    const tagsLength = computed(() => {
      return props.displayNameList.length;
    });

    const showTags = computed(() => {
      if (props.wrap) {
        return props.displayNameList;
      }
      if (tagsLength.value > 4) {
        return props.displayNameList.slice(0, 3);
      }
      const tags = [...props.displayNameList];
      for (let i = tags.length; i < 4; i++) {
        tags.push({ label: '' });
      }
      return tags;
    });

    const hideTags = computed(() => {
      if (props.wrap) {
        return '';
      }
      if (tagsLength.value > 4) {
        return props.displayNameList
          .slice(3, tagsLength.value)
          .map((i) => i.label)
          .join(',');
      }
      return '';
    });

    return {
      tagsLength,
      showTags,
      hideTags
    };
  }
});
</script>
<style lang="scss">
.gallery-tag-common-item {
  .gallery-tag {
    display: flex;
    width: 100%;
    overflow: hidden;
    margin: 0 -4px;
    position: relative;
    justify-content: inherit;

    .tag {
      height: 28px;
      background: var(--oio-input-tag-background);
      border-radius: 4px;
      flex-basis: calc(25% - 8px);
      display: flex;
      justify-content: center;
      color: var(--oio-primary-color);
      margin: 0 4px;

      .content {
        font-size: var(--oio-font-size-sm);
        font-weight: var(--oio-font-weight);
        padding: 4px 4px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        &.hideTags {
          text-align: center;
        }
      }
    }

    .tag-blank {
      flex-basis: calc(25% - 8px);
    }
  }
}

.default-card-title-wrap,
.default-card-content-wrap {
  .gallery-tag-common-item .gallery-tag {
    row-gap: 8px;
    flex-wrap: wrap;
  }
}
</style>
