<template>
  <div class="k-layout-extra-btn">
    <a-popover
      v-model:visible="visible"
      trigger="click"
      overlayClassName="message-popover-wrapper"
      @visibleChange="onShowPopover"
    >
      <template #content>
        <div class="message-tabs">
          <div
            class="message-tab-item"
            :class="[messageType === 'WORKFLOW' ? 'active' : '']"
            @click="onChangeMessageType('WORKFLOW')"
          >
            {{ translateValueByKey('任务待办') }}
          </div>
          <div
            class="message-tab-item"
            :class="[messageType === 'COPY' ? 'active' : '']"
            @click="onChangeMessageType('COPY')"
          >
            {{ translateValueByKey('抄送') }}
          </div>
          <div
            class="message-tab-item"
            :class="[messageType === 'NOTIFICATION' ? 'active' : '']"
            @click="onChangeMessageType('NOTIFICATION')"
          >
            {{ translateValueByKey('站内信') }}
          </div>
        </div>
        <div class="message-list k-layout-extra-btn-message">
          <div
            class="message-item mb-0"
            :class="[messageList.length ? 'message-item-pb' : 'message-item-normal']"
            @click="onWorkflowUserTask"
          >
            <div class="left-icon left-icon-primary">
              <i class="iconfont oinone-xitongtongzhi"></i>
            </div>
            <div class="center-content">
              <div class="title" style="font-weight: 500">{{ translateValueByKey(messageInfo.title) }}</div>
              <div class="des">
                {{ translateValueByKey('您好') }}，{{
                  getMessageCount() ? translateValueByKey('您有') : translateValueByKey('您暂无')
                }}{{ translateValueByKey(messageInfo.desc) }}
              </div>
            </div>
            <!--            <div class="right" v-if="messageList.length">-->
            <!--              <div class="number">{{ unreadNumber }}</div>-->
            <!--            </div>-->
          </div>

          <div class="message-item-content" v-if="messageList.length">
            <div
              class="message-item"
              v-for="(message, index) in messageList"
              v-show="message.messageType === messageType"
              :key="index"
            >
              <div class="left-icon left-icon-primary" :style="{ backgroundColor: messageInfo.color }">
                <i
                  class="iconfont"
                  :class="[message.message.workFlowTaskType === '审批' ? 'oinone-shenpi' : messageInfo.icon]"
                ></i>
              </div>
              <div class="center-content">
                <div class="title" style="font-weight: 500">
                  {{ message.message.name }}
                </div>
                <div class="des opacity-6">{{ formatDateTime(message.createDate) }}</div>
              </div>
              <div class="right">
                <div class="urge-workflow" v-if="message.message.extendIcon">{{ translateValueByKey('催') }}</div>
                <div
                  class="action"
                  @click="onDetail(message.message, message)"
                  v-if="message.messageType === 'WORKFLOW'"
                >
                  {{
                    message.message.workFlowTaskType === '审批'
                      ? translateValueByKey('去审批')
                      : translateValueByKey('去填写')
                  }}
                </div>
                <div
                  class="action"
                  @click="onDetail(message.message, message)"
                  v-else-if="message.messageType === 'COPY'"
                >
                  {{ translateValueByKey('去查看') }}
                </div>
                <div class="action" @click="onDetail(message.message, message)" v-else>
                  {{ translateValueByKey(messageInfo.btn) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <div class="btn">
        <oio-icon icon="oinone-xiaoxi" size="16px" />
        <span class="msg-text">{{ translateValueByKey('消息') }}</span>
        <div class="message-number" v-if="unreadNumber !== 0">{{ unreadNumber }}</div>
      </div>
    </a-popover>
    <a-modal
      :title="$translate(confirmModalTitle)"
      class="custom-modal"
      :width="420"
      :visible="isShowConfirmModal"
      @cancel="onHideConfirmModal"
    >
      <template #closeIcon>
        <div class="custom-close">
          <i class="iconfont oinone-guanbi1"></i>
        </div>
      </template>
      <template #footer>
        <oio-button key="submit" type="primary" @click="onHideConfirmModal">
          {{ translateValueByKey('确 定') }}</oio-button
        >
      </template>
      <div>
        <div v-html="currentMessage.body" class="message-richtext-wrapper"></div>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { OioButton, OioIcon } from '@kunlun/vue-ui-antd';
import { computed, defineComponent, ref } from 'vue';
import { translateValueByKey } from '@kunlun/engine';

export default defineComponent({
  name: 'DefaultNotification',
  inheritAttrs: false,
  components: {
    OioIcon,
    OioButton
  },
  props: [
    'msgTotal',
    'messageList',
    'getMessageInfo',
    'readMessage',
    'translate',
    'messageType',
    'messageInfo',
    'changeMessageType',
    'onDetail',
    'confirmModalTitle',
    'currentMessage',
    'currentMessageId',
    'isShowConfirmModal',
    'toggleDialog',
    'onWorkflowUserTask',
    'formatDateTime'
  ],
  setup(props) {
    const visible = ref(false);

    const onHideConfirmModal = async () => {
      await props.readMessage(props.currentMessageId);
      await props.getMessageInfo();
      props.toggleDialog();
    };

    const onShowPopover = (visible: boolean) => {
      if (visible) {
        props.getMessageInfo();
      }
    };

    const unreadNumber = computed(() => {
      if (props.msgTotal > 99) {
        return '99+';
      }
      return Number(props.msgTotal);
    });

    const onChangeMessageType = (type: string) => {
      props.changeMessageType(type);
    };

    const getMessageCount = () => {
      const messageIsExist = props.messageList.find((msg) => msg.messageType === props.messageType);
      return messageIsExist ? 1 : 0;
    };

    return {
      visible,
      unreadNumber,
      translateValueByKey,

      onShowPopover,
      onHideConfirmModal,
      getMessageCount,
      onChangeMessageType
    };
  }
});
</script>
<style lang="scss">
.k-layout-extra-btn {
  position: relative;

  .message-number {
    position: absolute;
    right: 0;
    top: 4px;
    background: #ff0000;
    border-radius: 10px;
    color: #fff;
    font-size: 12px;
    min-width: 6px;
    padding: 0 5px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    transform: translate(20%, -1px);
  }
}

.custom-modal {
  .ant-modal-header {
    padding: 16px;
  }

  .ant-modal-body {
    padding: 16px;
  }

  .ant-modal-footer {
    padding: 16px;

    .ant-btn {
      font-size: 14px;
      height: 40px;
      margin: auto;
      margin-left: 16px;
    }
  }

  .ant-modal-close-x {
    line-height: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 56px;
  }

  .custom-close {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #f1f1f1;
    display: flex;
    align-items: center;
    justify-content: center;

    .iconfont {
      color: rgba(0, 0, 0, 0.25);
      font-size: 12px;
      align-self: center;
      transform: scale(0.84);
    }
  }
}

.message-popover-wrapper {
  .ant-popover-inner-content {
    padding: 0;
  }

  .ant-popover-content {
    .ant-popover-arrow-content,
    .ant-popover-inner {
      background: var(--oio-background);
    }

    .message-tabs .message-tab-item {
      color: var(--oio-text-color);
    }

    .message-tabs .active {
      color: var(--oio-primary-color);
    }
  }
}

.message-tabs {
  padding: 12px 16px;
  box-shadow: inset 0px -1px 0px 0px var(--oio-border-color);
  display: flex;
  align-items: center;

  .message-tab-item {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    margin-right: 16px;
  }

  .active {
    color: var(--oio-primary-color);
    letter-spacing: 0;
    position: relative;
  }

  .active:before {
    content: '';
    position: absolute;
    bottom: -11px;
    background: var(--oio-primary-color);
    height: 1px;
    width: 100%;
  }
}

.k-layout-extra-btn-message {
  width: 378px;
  padding-bottom: 0px;

  .message-item-content {
    max-height: 376px;
    overflow-y: auto;
    margin-bottom: 16px;
  }

  .mb-0 {
    margin-bottom: 0;
  }

  .message-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    background: var(--oio-background);
    box-shadow: inset 0px -1px 0px 0px var(--oio-border-color);
    margin-bottom: 0;

    &:last-child {
      margin-bottom: 20px;
    }

    &.message-item-normal {
      padding-bottom: 0;
      border-bottom: 0;
      margin-bottom: 0;
    }

    &.message-item-pb {
      padding: 8px 16px;
      cursor: pointer;
      border-bottom: none;
      background: var(--oio-background);
      box-shadow: inset 0px -1px 0px 0px var(--oio-border-color);
    }

    &:last-child {
      margin-bottom: 0;
    }

    .left-icon {
      margin-right: 12px;
      width: 30px;
      height: 30px;
      border-radius: 30px;
      text-align: center;
      line-height: 30px;

      &.left-icon-primary {
        background-color: var(--oio-primary-color);

        i {
          font-size: 15px;
          color: #fff;
        }
      }
    }

    .center-content {
      flex: 1;

      .title {
        font-size: 14px;
        color: var(--oio-text-color);
        margin-bottom: 6px;
      }

      .des {
        letter-spacing: 0;
        font-size: 12px;
        color: var(--oio-text-color-secondary);

        &.opacity-6 {
          color: var(--oio-text-color-secondary);
        }
      }
    }

    .right {
      display: flex;
      align-items: center;

      .urge-workflow {
        font-size: 12px;
        color: #ff3232;
        background: rgba(255, 50, 50, 0.1);
        border-radius: 4px;
        width: 16px;
        height: 16px;
        line-height: 16px;
        text-align: center;
        margin-right: 12px;
      }

      .number {
        display: inline-block;
        background: #ff0000;
        border-radius: 10px;
        color: #fff;
        font-size: 12px;
        padding: 1px 6px;
        text-align: center;
      }

      .action {
        color: var(--oio-primary-color);
        cursor: pointer;
      }
    }
  }
}

// FIXME: 消息弹窗popover z-index 1030
.ant-modal-mask {
  z-index: 1031;
}

.ant-modal-wrap {
  z-index: 1032;

  .message-richtext-wrapper {
    img {
      max-width: 100%;
    }
  }
}
</style>
