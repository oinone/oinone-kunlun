<template>
  <li
    class="ant-dropdown-menu-item ant-dropdown-menu-item-only-child"
    :class="{ 'ant-dropdown-menu-item-disabled': disabled }"
    :title="title"
  >
    <span class="ant-dropdown-menu-title-content"><slot /></span>
  </li>
</template>

<script lang="ts">
export default {
  name: 'MenuItem',
  props: {
    title: String,
    disabled: Boolean
  }
};
</script>
