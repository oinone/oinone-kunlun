<script lang="ts">
import type { PamirsCompany, TableKeyboardConfig } from '@oinone/kunlun-engine';
import type { OioSelectItem } from '@oinone/kunlun-shared';
import { CastHelper, OioButton, PropRecordHelper, StringHelper } from '@oinone/kunlun-vue-ui-antd';
import { computed, createVNode, defineComponent, type PropType } from 'vue';
import { DefaultSelect, DefaultSelectProps } from '../base';
import { selectorCompanySelectOptionRender } from './render';

export default defineComponent({
  name: 'CompanySelect',
  components: {
    DefaultSelect,
    OioButton
  },
  inheritAttrs: false,
  props: {
    ...DefaultSelectProps,
    bizStyle: {
      type: String
    },
    tableKeyboardConfig: {
      type: Object as PropType<TableKeyboardConfig>
    }
  },
  setup(props) {
    const optionRender = computed(() => selectorCompanySelectOptionRender(props.bizStyle));

    return {
      optionRender
    };
  },
  render() {
    const {
      $attrs,

      dropdownClassName,
      bizStyle,
      tableKeyboardConfig,
      optionRender
    } = this;
    const classNames = ['oio-company-select'];
    const dropdownClassNames = ['oio-company-select-dropdown'];
    if (bizStyle) {
      classNames.push(`oio-company-select-${bizStyle}`);
      dropdownClassNames.push(`oio-company-select-dropdown-${bizStyle}`);
    }
    return createVNode(
      DefaultSelect,
      {
        ...PropRecordHelper.convert(DefaultSelectProps, CastHelper.cast(this)),
        ...PropRecordHelper.collectionBasicProps($attrs, classNames),
        dropdownClassName: StringHelper.append(dropdownClassNames, dropdownClassName),
        tableKeyboardConfig
      },
      {
        option: (data: OioSelectItem<PamirsCompany>) => optionRender(data)
      }
    );
  }
});
</script>
<style lang="scss">
.oio-company-select-dropdown {
  .ant-select-item {
    padding: 0 8px;
    margin: 0 4px;
    border-radius: 4px;
  }

  .ant-select-item-option-content > .oio-company-select-option-label {
    padding: 5px 0;
  }

  .oio-company-select-option {
    display: flex;
    column-gap: 8px;
    align-items: center;

    .oio-company-select-option-logo {
      text-align: center;
      color: #ffffff;
    }

    .oio-company-select-option-label {
      font-size: 14px;
      line-height: 22px;
      font-weight: 400;
    }
  }

  .oio-company-select-option-style1 {
    height: 32px;

    .oio-company-select-option-logo {
      width: 20px;
      height: 20px;
      line-height: 20px;
      border-radius: 4px;

      img {
        width: 20px;
        height: 20px;
        margin-bottom: 1em;
      }
    }

    .oio-company-select-option-logo-label {
      padding: 3px 5px;
      background-color: #4589ff;
      font-size: 10px;
      line-height: 14px;
    }

    .oio-company-select-option-label {
      flex: 1;
    }
  }

  .oio-company-select-option-style2 {
    height: 52px;

    .oio-company-select-option-wrapper {
      flex: 1;
    }

    .oio-company-select-option-logo {
      width: 36px;
      height: 36px;
      border-radius: 6px;

      img {
        width: 36px;
        height: 36px;
        border-radius: 6px;
      }
    }

    .oio-company-select-option-logo-label {
      padding: 4px 8px;
      background-color: #4589ff;
      font-size: 20px;
      line-height: 28px;
    }

    .oio-company-select-option-info {
      display: flex;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.25);
      line-height: 14px;
      font-weight: 400;
      align-items: center;

      .oio-divider {
        margin: 0 4px;
      }
    }
  }
}
</style>
