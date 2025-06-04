import {
  ConfirmOptions,
  MultiTabsRuntimeManifestMergedConfigManager,
  Page,
  RedirectTargetEnum,
  ROOT_HANDLE,
  RuntimeContext,
  translate,
  ViewActionCache
} from '@oinone/kunlun-engine';
import { ViewActionTarget } from '@oinone/kunlun-meta';
import { ISort } from '@oinone/kunlun-service';
import { getCookie, setCookie } from '@oinone/kunlun-shared';
import { Dialog as VanDialog } from 'vant';
import { isString, trim } from 'lodash-es';
import { HttpClient } from '@oinone/kunlun-request';
import { DslDefinition, DslDefinitionType } from '@oinone/kunlun-dsl';
import { DEFAULT_PREFIX } from '@oinone/kunlun-vue-ui-mobile-vant';
import { UrlQueryParameters } from '../basic';

export interface MobileConfirmOptions extends ConfirmOptions {
  teleport?: string | HTMLElement;
}

/**
 *@description 二次确认弹窗
 *
 * @param {string} confirm confirm文案
 * @return {Promise<boolean>} true or false
 *
 */
const executeConfirm = (confirm: string | MobileConfirmOptions): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    let options: MobileConfirmOptions;
    if (isString(confirm)) {
      options = {
        confirm
      };
    } else {
      options = confirm;
    }
    VanDialog.confirm({
      className: `${DEFAULT_PREFIX}-modal`,
      title: translate('kunlun.common.prompt'),
      message: options.confirm,
      confirmButtonText: options.enterText || translate('kunlun.common.confirm'),
      cancelButtonText: options.cancelText || translate('kunlun.common.cancel'),
      teleport: options.teleport
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

/**
 * 查询登录后跳转的地址，并且初始化上下文
 * 如果没有模块，那么会初始化上下文
 */
export async function homepageMaybeRuntimeContext(module?: string): Promise<UrlQueryParameters> {
  const redirect = await ViewActionCache.getHomepage(module);

  if (!redirect) {
    throw new Error('Invalid homepage');
  }
  const moduleName = redirect.resModuleDefinition?.name || redirect.moduleDefinition?.name;
  return {
    module: moduleName,
    model: redirect.model || redirect.resModel,
    viewType: redirect.viewType,
    action: redirect.name,
    scene: redirect.name,
    target: MultiTabsRuntimeManifestMergedConfigManager.isEnabled(moduleName)
      ? ViewActionTarget.OpenWindow
      : redirect.target,
    path: redirect.sessionPath
  };
}

function isMiniProgram() {
  const { userAgent } = navigator;
  if (userAgent.indexOf('AlipayClient') > -1) {
    // 支付宝小程序的 JS-SDK 防止 404 需要动态加载，如果不需要兼容支付宝小程序，则无需引用此 JS 文件。
    return true;
  }
  if (/QQ/i.test(userAgent) && /miniProgram/i.test(userAgent)) {
    // QQ 小程序
    return true;
  }
  if (/miniProgram/i.test(userAgent) && /micromessenger/i.test(userAgent)) {
    // 微信小程序 JS-SDK 如果不需要兼容微信小程序，则无需引用此 JS 文件。
    return true;
  }
  if (/toutiaomicroapp/i.test(userAgent)) {
    // 头条小程序 JS-SDK 如果不需要兼容头条小程序，则无需引用此 JS 文件。
    return true;
  }
  if (/swan/i.test(userAgent)) {
    // 百度小程序 JS-SDK 如果不需要兼容百度小程序，则无需引用此 JS 文件。
    return true;
  }
  if (/quickapp/i.test(userAgent)) {
    // quickapp
    return true;
  }
  return false;
}

function findWidget(
  dsl: DslDefinition,
  dslNodeType: DslDefinitionType,
  slot: string,
  widgetName?: string,
  skipParentSlots?: string[]
) {
  if (!dsl || (dsl.dslNodeType === dslNodeType && skipParentSlots?.length && skipParentSlots?.includes(dsl.slot))) {
    return null;
  }
  if (dsl.dslNodeType === dslNodeType && dsl.slot === slot && (!widgetName || widgetName === dsl.widget)) {
    return dsl;
  }
  if (dsl.widgets) {
    for (const widget of dsl.widgets) {
      const find = findWidget(widget, dslNodeType, slot, widgetName, skipParentSlots);
      if (find) {
        return find;
      }
    }
  }
}

function autoNoticeOuterUrl(url: string, autoOpen = true) {
  const miniProgram = isMiniProgram();
  const whiteDomainList = [location.host];
  if (miniProgram && !whiteDomainList.find((a) => url.includes(a))) {
    window.open(`/notice;url=${encodeURIComponent(url)}`, RedirectTargetEnum.SELF);
    return false;
  }
  autoOpen && window.open(url, miniProgram ? RedirectTargetEnum.SELF : RedirectTargetEnum.BLANK);
  return true;
}

function createSorting(ordering: string): ISort[] {
  const orderingStr = ordering || 'createDate DESC, id DESC';
  const orderList = orderingStr.split(',');
  return (orderList || []).map((a) => {
    const [sortField, direction] = trim(a).split(' ');
    return { sortField, direction: direction.toUpperCase() };
  }) as ISort[];
}

function getCurrentTenant() {
  const { 'oio-tenant': tenant } = HttpClient.getInstance().getHeaders();
  return tenant || getCookie('oio-tenant');
}

function createFakeElement(value) {
  const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
  const fakeElement = document.createElement('span');
  // Prevent zooming on iOS
  fakeElement.style.all = 'unset';
  fakeElement.style.fontSize = '12pt';
  // Reset box model
  fakeElement.style.border = '0';
  fakeElement.style.padding = '0';
  fakeElement.style.margin = '0';
  // Move element out of screen horizontally
  // fakeElement.style.position = 'absolute';
  fakeElement.style[isRTL ? 'right' : 'left'] = '-9999px';
  // Move element to the same position vertically
  const yPosition = window.pageYOffset || document.documentElement.scrollTop;
  fakeElement.style.top = `${yPosition}px`;
  fakeElement.textContent = value;

  return fakeElement;
}
function copyText(copyData: string) {
  // 创建range对象
  const range = document.createRange();
  // 获取复制内容的 id 选择器
  const copyDataEle = createFakeElement(copyData?.trim());
  document.body.append(copyDataEle);
  range.selectNode(copyDataEle);
  // 创建 selection对象
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  // 如果页面已经有选取了的话，会自动删除这个选区，没有选区的话，会把这个选取加入选区
  if (selection.rangeCount > 0) {
    selection?.removeAllRanges?.();
  }
  // 将range对象添加到selection选区当中，会高亮文本块
  selection.addRange(range);
  // 复制选中的文字到剪贴板
  document.execCommand('copy');
  // 移除选中的元素
  selection.removeRange(range);
  document.body.removeChild(copyDataEle);
}

function initTenant(page: Page & { tenant: string; session: string }) {
  let { session, tenant } = page;
  if (tenant) {
    setCookie('oio-tenant', tenant, 3600 * 6);
  } else {
    tenant = getCookie('oio-tenant')!;
  }
  if (tenant) {
    const http = HttpClient.getInstance();
    // saas租户用
    http.setHeaders({ 'oio-tenant': tenant });
  }
  if (session) {
    const expireDate = new Date();
    const expireDays = 1;
    expireDate.setTime(expireDate.getTime() + 24 * 60 * 60 * 1000 * expireDays);
    document.cookie = `pamirs_uc_session_id=${session};path=/;expires=${expireDate.toUTCString()};`;
    // console.log('pamirs_uc_session_id', page.session);
    // setCookie('pamirs_uc_session_id', page.session, 24 * 60 * 60 * 1000 * expireDays)
  }
}

function isTopViewWidget(metadataRuntimeContext: RuntimeContext | undefined) {
  return !metadataRuntimeContext?.parentContext || metadataRuntimeContext?.parentContext?.handle === ROOT_HANDLE;
}

export {
  executeConfirm,
  isMiniProgram,
  findWidget,
  autoNoticeOuterUrl,
  createSorting,
  getCurrentTenant,
  copyText,
  initTenant,
  isTopViewWidget
};
