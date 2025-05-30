interface ILangConfig {
  kunlun: {
    common: {
      loading: string;
      success: string;
      error: string;
      save: string;
      confirm: string;
      cancel: string;
      delete: string;
      back: string;
      more: string;
      loadmore: string;
      displayAll: string;
      noViewAction: string;
      verificationCode: string;
      prompt: string;
      PackUpMenu: string;
    };
    fields: {
      upload: {
        fileType: string;
        fileSize: string;
      };
      boolean: {
        true: string;
        false: string;
      };
    };
    button: {
      search: string;
      create: string;
      edit: string;
      delete: string;
      confirm: string;
      reset: string;
      expand: string;
      fold: string;
      upload: string;
    };
    message: string;
    breadcrumbs: {
      currentPosition: string;
      index: string;
    };
    field: {
      discountTip: string;
      required: string;
    };
    customs: {
      deleteCategoryConfirm: string;
    };
    table: {
      strip: string;
      page: string;
      operation: string;
      emptyText: string;
    };
    export: {
      tips: string;
    };
    import: {
      tips: string;
      uploadField: string;
    };
    condition: {
      equal: string; // 等于
      notEqual: string; // 不等于
      null: string; // 为空
      notNull: string; // 不为空
      contain: string; // 包含
      notContain: string; // 不包含
      greater: string; // 大于
      lessThan: string; // 小于
      greaterOrEqual: string; // 大于或等于
      lessThanOrEqual: string; // 小于或等于
      laterThat: string; // 晚于
      laterThatOrEqual: string; // 晚于或等于
      soonerThan: string; // 早于
      soonerThanOrEqual: string; // 早于或等于
      between: string; // 介于
    };
  };
}

export default ILangConfig;
