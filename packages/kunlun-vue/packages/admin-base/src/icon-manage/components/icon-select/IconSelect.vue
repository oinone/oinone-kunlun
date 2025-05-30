<script lang="ts">
import { translateValueByKey } from '@kunlun/engine';
import { OioIcon, OioInputSearch, OioTooltip } from '@kunlun/vue-ui-antd';
import { DESIGNER_ICON_LIST, MENU_ICON_LIST } from '@kunlun/vue-ui-common';
import { RadioButton as ARadioButton, RadioGroup as ARadioGroup } from 'ant-design-vue';
import { computed, createVNode, defineComponent, PropType, ref } from 'vue';
import { IconDefine } from './typing';

export default defineComponent({
  name: 'IconSelect',
  components: {
    OioInputSearch,
    OioIcon,
    OioTooltip,
    ARadioGroup,
    ARadioButton
  },
  props: {
    value: {
      type: String
    },
    data: {
      type: [String, Array] as PropType<keyof typeof IconDefine | string[]>
    }
  },
  emits: ['update:value'],
  setup(props, context) {
    const searchValue = ref<string>('');

    const internalData = computed<string[]>(() => {
      const customData = props.data;
      if (Array.isArray(customData)) {
        return customData;
      }
      if (customData === IconDefine.menu) {
        return MENU_ICON_LIST;
      }
      if (customData === IconDefine.designer) {
        return DESIGNER_ICON_LIST;
      }
      return MENU_ICON_LIST;
    });

    const currentIconList = computed(() => {
      const sv = searchValue.value;
      if (sv) {
        return internalData.value.filter((v) => v.indexOf(sv) !== -1);
      }
      return internalData.value;
    });

    const onChange = (event) => {
      context.emit('update:value', event.target.value);
    };

    return {
      searchValue,
      currentIconList,
      onChange
    };
  },
  render() {
    return [
      createVNode('div', { class: 'icon-select' }, [
        createVNode('div', { class: 'icon-search' }, [
          createVNode(OioInputSearch, {
            value: this.searchValue,
            placeholder: translateValueByKey('请输入图标名称搜索'),
            'onUpdate:value': (val) => (this.searchValue = val)
          })
        ]),
        createVNode('div', { class: 'icon-select-options oio-scrollbar' }, [
          createVNode(
            ARadioGroup,
            {
              value: this.value,
              onChange: this.onChange
            },
            {
              default: () => {
                const finalList = this.currentIconList;
                const lastRowIndexes = (finalList.length / 5 - 1) * 5;
                return finalList.map((item, index) => {
                  const classList: string[] = [];
                  const remainder = index % 5;
                  if (remainder === 0) {
                    classList.push('icon-item-row-first');
                  } else if (remainder === 4) {
                    classList.push('icon-item-row-last');
                  }
                  if (index >= lastRowIndexes) {
                    classList.push('icon-item-last-row');
                  }
                  return createVNode(
                    ARadioButton,
                    { class: classList, key: item, value: item },
                    {
                      default: () => [
                        createVNode('div', { class: 'icon-item' }, [
                          createVNode(OioIcon, { size: '20px', icon: item })
                        ]),
                        createVNode(OioTooltip, { class: 'icon-item-title', title: item }, { default: () => item })
                      ]
                    }
                  );
                });
              }
            }
          )
        ])
      ])
    ];
  }
});
</script>
<style lang="scss">
.icon-select {
  width: 100%;
  height: calc(56vh - 32px);
  position: relative;

  .icon-search {
    width: 100%;
  }

  .icon-select-options {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: calc(100% - 40px);
    overflow-y: auto;
    padding-top: 16px;

    .ant-radio-group {
      height: 100%;
    }

    .ant-radio-button-wrapper {
      width: 86px;
      height: 86px;
      background: rgba(244, 244, 244, 0.5);
      border: 1px solid #e3e7ee;
      border-radius: 4px;
      padding: 0;
      -webkit-box-shadow: none;
      box-shadow: none;
      margin-right: 16px;
      margin-bottom: 16px;

      &:not(:first-child):before {
        display: none;
      }

      &:hover {
        border-color: var(--oio-primary-color-hover);
        color: var(--oio-primary-color-hover);
      }
    }

    .icon-item-row-last {
      margin-right: 0;
    }

    .icon-item-last-row {
      margin-bottom: 0;
    }

    .ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
      border-color: var(--oio-primary-color);
      color: var(--oio-primary-color);
    }

    .icon-item {
      display: block;
      width: 24px;
      height: 24px;
      margin: 16px 31px 0 31px;

      .oio-icon {
        color: var(--oio-primary-color);
      }
    }

    .icon-item-title {
      display: block;
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 8px;
      padding: 0 4px;
    }
  }
}
</style>
