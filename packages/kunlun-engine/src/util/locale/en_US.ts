import ILangConfig from './type';

export default {
  kunlun: {
    common: {
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      save: 'Save',
      confirm: 'Confirm',
      cancel: 'Cancel',
      delete: 'Delete',
      back: 'Back',
      more: 'More',
      loadmore: 'Loadmore',
      displayAll: 'Display All',
      noViewAction: 'No view action in this application',
      create: 'create',
      deleteConfirm: 'Are you sure you want to delete it?',
      edit: 'edit',
      revise: 'edit',
      add: 'add',
      copy: 'copy',
      executeResult: 'Result',
      executeSuccess: 'Success',
      runError: 'Error in running expression',
      custom: 'custom',
      showOption: 'show options',
      verificationCode: 'verification code',
      prompt: 'prompt',
      PackUpMenu: 'pack up menu'
    },
    fields: {
      upload: {
        fileType: 'Only support {exts} format files',
        fileSize: 'The size of file can not be large than {size}',
        uploadImage: 'upload image',
        preview: 'preview'
      },
      boolean: {
        true: 'Yes',
        false: 'No'
      }
    },
    o2mImport: {
      notConfig: 'Fields not configured for import',
      dataError: 'Incorrect data format, {col} column not found',
      dataEmpty: "'{key}' of {index} data cannot be empty",
      dataNotExist: 'The product with {key} {errorData} does not exist or the quantity of the product is insufficient',
      or: 'or'
    },
    button: {
      search: 'Search',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      confirm: 'Confirm',
      reset: 'Reset',
      expand: 'Expand',
      fold: 'Fold',
      upload: 'Click upload'
    },
    message: 'Message',
    breadcrumbs: {
      currentPosition: 'current position',
      index: 'index'
    },
    menu: {
      searchMenu: 'search menu',
      collapseMenu: 'collapse menu',
      jumpTip: 'Do you want to jump?',
      tip: 'Tip'
    },
    field: {
      discountTip: 'The discount amount cannot be greater than or equal to the total amount of the selected goods',
      required: 'required'
    },
    customs: {
      deleteCategoryConfirm: 'Delete this category?'
    },
    table: {
      strip: '',
      page: 'page',
      operation: 'operation',
      emptyText: 'No data'
    },
    export: {
      tips: 'please choice template'
    },
    import: {
      tips: 'please choice template',
      uploadField: 'please upload the file'
    },
    condition: {
      equal: 'is equal to', // 等于
      notEqual: 'is not equal to', // 不等于
      null: 'is set', // 为空
      notNull: 'is not set', // 不为空
      contain: 'contains', // 包含
      notContain: `doesn't contain`, // 不包含
      greater: 'greater', // 大于
      lessThan: 'less than', // 小于
      greaterOrEqual: 'greater than or equal to', // 大于或等于
      lessThanOrEqual: 'less than or equal to', // 小于或等于
      laterThat: 'later than', // 晚于
      laterThatOrEqual: 'later than or equal to', // 晚于或等于
      soonerThan: 'sooner than', // 早于
      soonerThanOrEqual: 'sooner than or equal to', // 早于或等于
      between: 'between' // 介于
    }
  }
} as ILangConfig;
