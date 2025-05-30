<template>
  <div class="empty-permission flex-c-c flex-1">
    <div style="text-align: center">
      <img style="width: 243px" :src="genStaticPath('无权限@2x_1675843265937.png')" alt="" />
      <div class="mt-6 grey">{{ $translate(title) }}</div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { defineProps, withDefaults } from 'vue';
import { genStaticPath } from '@kunlun/engine';

withDefaults(defineProps<{ title: string }>(), { title: '当前无可配置权限，请先选择应用/菜单' });
</script>
