import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import {
  ConfirmOptions,
  MultiTabsConfigManager,
  translate,
  translateValueByKey,
  ViewActionCache
} from '@kunlun/engine';
import { ViewActionTarget } from '@kunlun/meta';
import { MessageHub } from '@kunlun/request';
import { Modal } from 'ant-design-vue';
import { isString } from 'lodash-es';
import { createVNode } from 'vue';
import { UrlQueryParameters } from '../basic/types';

/**
 *@description 二次确认弹窗
 *
 * @param {string} confirm confirm文案
 * @return {Promise<boolean>} true or false
 *
 */
const executeConfirm = (confirm: string | ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    let options: ConfirmOptions;
    if (isString(confirm)) {
      options = {
        confirm
      };
    } else {
      options = confirm;
    }
    // 这个要helper里面拿各种工具类
    Modal.confirm({
      class: `oio-modal`,
      title: translateValueByKey(translate('kunlun.common.prompt')),
      icon: createVNode(ExclamationCircleOutlined),
      zIndex: options.zIndex,
      content: options.confirm,
      okText: options.enterText || translateValueByKey(translate('kunlun.common.confirm')),
      cancelText: options.cancelText || translateValueByKey(translate('kunlun.common.cancel')),
      onOk() {
        resolve(true);
      },
      onCancel() {
        resolve(false);
      }
    });
  });
};

/**
 * 查询登录后跳转的地址，并且初始化上下文
 * 如果没有模块，那么会初始化上下文
 */
export async function homepageMaybeRuntimeContext(module?: string, force = false): Promise<UrlQueryParameters> {
  const redirect = await ViewActionCache.getHomepage(module, force);
  if (!redirect) {
    MessageHub.error(translateValueByKey('未找到入口应用或无权限访问'));
    throw new Error('Invalid homepage');
  }
  const moduleName = redirect.resModuleDefinition?.name || redirect.moduleDefinition?.name;
  return {
    module: moduleName,
    model: redirect.model || redirect.resModel,
    viewType: redirect.viewType,
    action: redirect.name,
    scene: redirect.name,
    target: MultiTabsConfigManager.isEnabled(moduleName) ? ViewActionTarget.OpenWindow : redirect.target,
    path: redirect.sessionPath
  };
}

export { executeConfirm };
