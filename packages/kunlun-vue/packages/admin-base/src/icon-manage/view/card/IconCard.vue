<script lang="ts">
import { ActiveRecord, genStaticPath } from '@kunlun/engine';
import { OioButton, OioPopconfirm } from '@kunlun/vue-ui-antd';
import { OioIcon, PropRecordHelper } from '@kunlun/vue-ui-common';
import { DslRenderDefinition } from '@kunlun/vue-widget';
import { createVNode, defineComponent, PropType, VNode } from 'vue';

export default defineComponent({
  name: 'IconCard',
  components: {
    OioIcon,
    OioButton,
    OioPopconfirm
  },
  inheritAttrs: false,
  props: {
    template: {
      type: Object as PropType<DslRenderDefinition>
    },
    iconData: {
      type: Object as PropType<ActiveRecord>
    },
    rowIndex: {
      type: Number
    }
  },
  setup() {},
  render() {
    const { iconData, rowIndex } = this;
    if (!iconData) {
      return;
    }

    const defaultActionBar: VNode[] | undefined = PropRecordHelper.collectionSlots(this.$slots, [
      {
        origin: 'default',
        isNotNull: true
      }
    ]).default()[0].children as VNode[];
    if (defaultActionBar && defaultActionBar.length) {
      defaultActionBar.forEach((action) => {
        if (action.props) {
          action.props.slotContext = { data: iconData, index: rowIndex };
        }
      });
    }

    const children: VNode[] = [];

    if (iconData.sys) {
      children.push(
        createVNode('img', { class: 'default-iconCard-sys', src: genStaticPath('icon-manage/icon-manage-sys.png') })
      );
    }

    const content = createVNode('div', { class: 'default-iconCard-content' }, [
      createVNode('div', { class: 'default-iconCard-content-icon' }, [
        createVNode(OioIcon, {
          icon: iconData.fullFontClass,
          size: 25,
          color: '#6C757D'
        })
      ]),
      createVNode('div', { class: 'default-iconCard-content-text' }, [
        createVNode('div', {}, iconData.displayName || iconData.name),
        createVNode('div', {}, iconData.fullFontClass)
      ])
    ]);
    children.push(content);

    const actionBar = createVNode(defaultActionBar[0]);
    children.push(actionBar);
    return createVNode(
      'div',
      {
        class: 'default-iconCard'
      },
      children
    );
  }
});
</script>

<style lang="scss">
.default-iconCard {
  flex: 0 0 calc(100% / 12 - var(--oio-row-gap) * 11 / 12);
  position: relative;
  width: calc(100% / 12 - var(--oio-row-gap) * 11 / 12);
  height: auto;
  background: var(--oio-background);
  border: 1px solid #ededed;
  border-radius: 4px;

  @supports (aspect-ratio: 1 / 1.13) {
    aspect-ratio: 1 / 1.13;
  }

  @supports not (aspect-ratio: 1 / 1.13) {
    height: 132px;
  }

  & > .default-iconCard {
    &-sys {
      position: absolute;
      width: 21%;
    }

    &-content {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;

      & > .default-iconCard-content {
        &-icon {
          flex: 0 0 50%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        &-text {
          flex: 0 0 50%;
          width: 100%;

          & > * {
            text-align: center;
            padding-left: var(--oio-padding-md);
            padding-right: var(--oio-padding-md);
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            font-family: PingFangSC-Regular;
            font-size: 12px;
            color: var(--oio-text-color-secondary);
            font-weight: 400;
          }
        }
      }
    }
  }

  & > .default-iconCard-actions {
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    background: rgba(5, 11, 34, 0.8);
    border-radius: 4px;
    z-index: 1;
    display: none;

    & > .default-iconCard-action {
      position: relative;
      flex: 0 0 50%;
      height: 33.3333%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      & > .oio-action-item {
        position: absolute;
        opacity: 0;
        width: 100%;
        height: 100%;

        & > .oio-button {
          width: 100%;
          height: 100%;
        }
      }

      & > .oio-icon {
        --oio-icon-color: var(--oio-background);
      }

      &:hover {
        background: #0a1331;

        & > .oio-icon {
          --oio-icon-color: var(--oio-primary-color);
        }
      }
    }
  }

  &:hover {
    & > .default-iconCard-actions {
      display: flex;
      flex-flow: row wrap;
      align-content: flex-start;
    }
  }
}
</style>