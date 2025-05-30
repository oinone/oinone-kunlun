<template>
  <div class="search-content">
    <a-spin :spinning="loading">
      <a-input-search
        class="oio-input"
        :placeholder="dslNode.children[0] ? dslNode.children[0].placeHolderText : ''"
        :value="searchText"
        @change="onChange"
        cleanable
      />
      <a-tree :tree-data="proxyTreeData" show-icon @select="onSelect" :loadData="loadData">
        <template #icon="{ url }" v-if="showLogo">
          <span class="custom-tree-node-logo" v-if="showLogo">
            <!-- <div v-if="!url" class="logo-placeholder"></div> -->
            <img v-if="url" :src="url" alt />
          </span>
        </template>
      </a-tree>
    </a-spin>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { Spin, Input, Tree } from 'ant-design-vue';

export default defineComponent({
  props: ['loading', 'dslNode', 'searchText', 'onChange', 'proxyTreeData', 'onSelect', 'showLogo', 'loadData'],
  components: {
    ASpin: Spin,
    AInputSearch: Input,
    ATree: Tree
  }
});
</script>
