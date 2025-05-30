<template>
  <a-dropdown :trigger="['click']" placement="bottomLeft" overlayClassName="top-bar-common-dropdown">
    <div class="k-user">
      <img :src="pamirsUser.avatarUrl || genStaticPath('man_1651543408256.png')" />
      <span v-if="hasCurrentUser">{{ pamirsUser.nickname || pamirsUser.name || pamirsUser.realname }}</span>
      <caret-down-outlined :style="{ fontSize: '12px', color: 'var(--oio-icon-color)' }" />
    </div>
    <template #overlay>
      <a-menu class="k-user-dropdown">
        <a-menu-item @click="onUserCenter">
          <div class="menu-user">
            <img :src="pamirsUser.avatarUrl || genStaticPath('man_1651543408256.png')" />
            <span v-if="hasCurrentUser">{{ pamirsUser.nickname || pamirsUser.name || pamirsUser.realname }}</span>
          </div>
        </a-menu-item>

        <div class="k-user-dropdown-group" v-for="(item, index) in actionGroups" :key="index">
          <a-menu-item
            class="k-user-dropdown-action"
            v-for="action in item.actions"
            :key="action.id"
            @click="executeAction(action)"
          >
            <oio-icon
              v-if="action.attributes"
              :icon="action.attributes.icon || 'oinone-yingyong'"
              :size="action.attributes.size || 14"
              :style="{ 'margin-right': '12px', color: action.attributes.color || 'var(--user-dropdown-icon-color)' }"
            />
            {{ $translate(action.displayName) }}
          </a-menu-item>
        </div>
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script lang="ts">
import { CaretDownOutlined } from '@ant-design/icons-vue';
import { UserInfo } from '@kunlun/engine';

import { OioIcon } from '@kunlun/vue-ui-antd';
import { computed, defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'DefaultUser',
  inheritAttrs: false,
  components: {
    CaretDownOutlined,
    OioIcon
  },
  props: {
    userInfo: {
      type: Object as PropType<UserInfo>,
      default: () => ({})
    },
    executeAction: {
      type: Function,
      required: true
    },
    genStaticPath: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const pamirsUser = computed(() => (props.userInfo ? props.userInfo.pamirsUser || {} : {}));

    const hasCurrentUser = computed(() => {
      return !!props.userInfo?.pamirsUser;
    });

    const userCenterAction = computed(() => {
      return props.userInfo.userAvatarAction;
    });

    const actionGroups = computed(() => {
      if (!props.userInfo) {
        return [];
      }
      return props.userInfo.actionGroups || [];
    });

    const onUserCenter = () => {
      if (userCenterAction.value) {
        props.executeAction!(userCenterAction.value);
      }
    };

    return { actionGroups, pamirsUser, onUserCenter, hasCurrentUser };
  }
});
</script>
