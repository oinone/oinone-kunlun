<script lang="ts">
import { ActiveRecord, RuntimeModelField } from '@oinone/kunlun-engine';
import { OioTab, OioTabs } from '@oinone/kunlun-vue-ui-antd';
import { createVNode, defineComponent, nextTick, PropType, ref, VNode, watch } from 'vue';
import { CATE_ALL_NAME } from './types';

export default defineComponent({
  name: 'DefaultSearchTab',
  inheritAttrs: false,
  slots: ['default'],
  props: {
    formData: {
      type: Object,
      default: () => {}
    },
    topCateModelField: {
      type: Object as PropType<RuntimeModelField>
    },
    secondCateModelField: {
      type: Object as PropType<RuntimeModelField>
    },
    topCateFieldOptions: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    secondCateFieldOptions: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    cateFields: {
      type: Array as PropType<string[]>
    },
    onCateSearch: {
      type: Function
    }
  },
  setup(props) {
    const topCateActive = ref(0);
    const secondCateActive = ref(0);

    const onChangeTopCate = () => {
      onCateSearch();
    };
    const onChangeSecondaryCate = (index: number) => {
      secondCateActive.value = index;
      onCateSearch();
    };

    function onCateSearch() {
      const formData = {};
      if (props.topCateModelField) {
        const topCateName = props.topCateFieldOptions[topCateActive.value]?.name;
        if (topCateName !== CATE_ALL_NAME) {
          formData[props.topCateModelField.name] = props.topCateModelField.multi ? [topCateName] : topCateName;
        } else {
          formData[props.topCateModelField.name] = null;
        }
      }
      if (props.secondCateModelField) {
        const secondCateName = props.secondCateFieldOptions[secondCateActive.value]?.name;
        if (secondCateName !== CATE_ALL_NAME) {
          formData[props.secondCateModelField.name] = props.secondCateModelField.multi
            ? [secondCateName]
            : secondCateName;
        } else {
          formData[props.secondCateModelField.name] = null;
        }
      }
      nextTick(() => {
        props?.onCateSearch?.(formData);
      });
    }

    const resetCateActive = (searchBody: ActiveRecord) => {
      if (props.topCateModelField) {
        let newTopName = searchBody?.[props.topCateModelField.name];
        newTopName = Array.isArray(newTopName) ? newTopName?.[0] : newTopName;
        topCateActive.value = newTopName ? props.topCateFieldOptions.findIndex((a) => a.name === newTopName) : 0;
      }
      if (props.secondCateModelField) {
        const newSecondName = searchBody?.[props.secondCateModelField.name];
        secondCateActive.value = newSecondName
          ? props.secondCateFieldOptions.findIndex((a) => a.name === newSecondName)
          : 0;
      }
    };

    watch(
      [() => props.formData, () => props.topCateModelField, () => props.secondCateModelField],
      () => {
        resetCateActive(props.formData);
      },
      { immediate: true, deep: true }
    );

    return {
      origin,
      topCateActive,
      secondCateActive,
      onChangeTopCate,
      onChangeSecondaryCate
    };
  },
  render() {
    const cateSearchNodes = [] as VNode[];
    if (this.topCateFieldOptions?.length) {
      cateSearchNodes.push(
        createVNode(
          OioTabs,
          {
            class: 'oio-cate-search',
            activeKey: this.topCateActive,
            'onUpdate:activeKey': (val) => (this.topCateActive = val),
            onChange: this.onChangeTopCate
          },
          this.topCateFieldOptions.map((option, index) => {
            return createVNode(OioTab, { tab: option.label || option.displayName, key: index });
          })
        )
      );
      if (this.secondCateFieldOptions?.length) {
        cateSearchNodes.push(
          createVNode(
            'div',
            { class: 'oio-cate-search-second' },
            this.secondCateFieldOptions.map((option, index) => {
              return createVNode(
                'div',
                {
                  class: [this.secondCateActive === index && 'active', 'secondary-action'],
                  onClick: () => this.onChangeSecondaryCate(index)
                },
                option.label || option.displayName
              );
            })
          )
        );
      }
    }

    return cateSearchNodes;
  }
});
</script>
