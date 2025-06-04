<template>
  <gallery-common-field
    :value="!optionColor ? displayNameListStr : displayNameList.length ? displayNameList : undefined"
    :justify-content="justifyContent"
    :empty-style="emptyStyle"
  >
    <template #default>
      <div v-if="optionColor" class="gallery-tag">
        <div
          class="tag"
          v-for="(item, index) in showTags"
          :key="item"
          :style="{
            width: displayNameList.length > 1 ? '25%' : 'unset',
            color: item.color,
            'background-color': item.backgroundColor
          }"
        >
          <div class="content" v-if="index < 3" :title="item.label">
            {{ item.label }}
          </div>
          <div class="content hideTags" v-if="index === 3" :title="hideTags">
            <oio-icon icon="oinone-gengduo1" color="var(--oio-primary-color)" />
          </div>
        </div>
      </div>
      <span v-else>{{ displayNameListStr }}</span>
    </template>
  </gallery-common-field>
</template>
<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
import { OioIcon } from '@oinone/kunlun-vue-ui-common';
import GalleryCommonField from '../../common/GalleryCommonField.vue';

export default defineComponent({
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
    }
  },
  components: { GalleryCommonField, OioIcon },
  inheritAttrs: false,
  setup(props) {
    const tagsLength = computed(() => {
      return props.displayNameList.length;
    });
    const showTags = computed(() => {
      const tags = [] as Record<string, string>[];
      if (tagsLength.value > 3) {
        tags.push(...props.displayNameList.slice(0, 3));
        tags.push({ label: '...', color: 'unset', 'background-color': 'unset' });
        return tags;
      }
      return props.displayNameList;
    });
    const hideTags = computed(() => {
      if (tagsLength.value > 3) {
        return props.displayNameList.slice(3, tagsLength.value).map((i) => i.label);
      }
      return [];
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
.gallery-tag {
  display: flex;
  width: 100%;
  overflow: hidden;
  position: relative;
  justify-content: inherit;

  .tag {
    height: 28px;
    background: var(--oio-input-tag-background);
    border-radius: 4px;
    width: 25%;
    display: flex;
    justify-content: center;
    color: var(--oio-primary-color);
    margin-right: 4%;

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
}
</style>
