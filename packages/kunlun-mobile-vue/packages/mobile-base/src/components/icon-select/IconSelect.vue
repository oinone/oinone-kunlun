<script lang="ts">
import { DEFAULT_PREFIX, OioIcon, OioInputSearch } from '@oinone/kunlun-vue-ui-mobile-vant';
import { Radio as VanRadio, RadioGroup as VanRadioGroup } from 'vant';
import { computed, createVNode, defineComponent, PropType, ref } from 'vue';
import { translateValueByKey } from '@oinone/kunlun-engine';
import { data1, data2 } from './data';
import { IconDefine } from './typing';

export default defineComponent({
  name: 'IconSelect',
  components: {
    OioInputSearch,
    OioIcon,
    VanRadioGroup,
    VanRadio
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
        return data1;
      }
      if (customData === IconDefine.designer) {
        return data2;
      }
      return data1;
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
      createVNode('div', { class: 'mobile-icon-select' }, [
        createVNode('div', { class: 'icon-search' }, [
          createVNode(OioInputSearch, {
            value: this.searchValue,
            placeholder: translateValueByKey('请输入图标名称搜索'),
            'onUpdate:value': (val) => (this.searchValue = val)
          })
        ]),
        createVNode('div', { class: `icon-select-options ${DEFAULT_PREFIX}-scrollbar` }, [
          createVNode(
            VanRadioGroup,
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
                    VanRadio,
                    { class: classList, key: item, value: item },
                    {
                      default: () => [
                        createVNode('div', { class: 'icon-item-title', title: item }, { default: () => item })
                      ],
                      icon: () => [
                        createVNode('div', { class: 'icon-item' }, [createVNode(OioIcon, { size: '20px', icon: item })])
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
.mobile-icon-select {
  width: 100%;
  height: calc(56vh - 32px);
  position: relative;

  .icon-search {
    width: 100%;
  }

  .mobile-icon-select-options {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: calc(100% - 40px);
    overflow-y: auto;
    padding-top: 16px;

    .icon-item-row-last {
      margin-right: 0;
    }

    .icon-item-last-row {
      margin-bottom: 0;
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
