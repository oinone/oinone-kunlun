import ILangConfig from './type';

export default {
  kunlun: {
    common: {
      loading: '加载中...',
      save: '保存',
      confirm: '确定',
      cancel: '取消',
      delete: '删除',
      back: '返回',
      more: '更多',
      loadmore: '加载更多',
      displayAll: '显示所有',
      noViewAction: '应用没有视图动作',
      create: '创建',
      deleteConfirm: '确定要删除吗？',
      edit: '编辑',
      revise: '修改',
      add: '添加',
      copy: '复制',
      executeResult: '执行结果',
      executeSuccess: '执行成功',
      runError: '运行表达式错误',
      custom: '自定义',
      showOption: '展示选项',
      verificationCode: '短信验证码',
      prompt: '提示',
      PackUpMenu: '收起菜单',
      info: '提示',
      warning: '警告',
      warn: '警告',
      success: '成功',
      error: '失败',
      debug: '调试'
    },
    fields: {
      upload: {
        fileType: '只支持{exts}格式的文件',
        fileSize: '文件大小不能超过{size}',
        uploadImage: '上传图片',
        preview: '预览'
      },
      boolean: {
        true: '是',
        false: '否'
      }
    },

    o2mImport: {
      notConfig: '未配置导入字段Fields not configured for import',
      dataError: '数据格式不正确，未找到{col}列',
      dataEmpty: '第{index}条数据的"{key}"不能为空',
      dataNotExist: '{key}为{errorData}的产品不存在或出库数量不足',
      or: '或'
    },

    button: {
      search: '搜索',
      create: '创建',
      edit: '编辑',
      delete: '删除',
      confirm: '提交',
      reset: '重置',
      expand: '展开',
      fold: '折叠',
      upload: '点击上传'
    },
    message: '消息',
    breadcrumbs: {
      currentPosition: '当前位置',
      index: '首页'
    },
    menu: {
      searchMenu: '搜索菜单',
      collapseMenu: '收起菜单',
      jumpTip: '是否要跳转？',
      tip: '提示'
    },
    field: {
      discountTip: '优惠金额不得大于或等于所选商品的总金额',
      required: '必填'
    },
    customs: {
      deleteCategoryConfirm: '是否删除？'
    },
    table: {
      strip: '条',
      page: '页',
      operation: '操作',
      emptyText: '暂无数据'
    },
    export: {
      tips: '请选择模版'
    },
    import: {
      tips: '请选择模版',
      uploadField: '请上传文件'
    },
    condition: {
      equal: '等于', // 等于
      notEqual: '不等于', // 不等于
      null: '为空', // 为空
      notNull: '不为空', // 不为空
      contain: '包含', // 包含
      notContain: '不包含', // 不包含
      greater: '大于', // 大于
      lessThan: '小于', // 小于
      greaterOrEqual: '大于或等于', // 大于或等于
      lessThanOrEqual: '小于或等于', // 小于或等于
      laterThat: '晚于', // 晚于
      laterThatOrEqual: '晚于或等于', // 晚于或等于
      soonerThan: '早于', // 早于
      soonerThanOrEqual: '早于或等于', // 早于或等于
      between: '介于' // 介于
    }
  }
} as ILangConfig;
