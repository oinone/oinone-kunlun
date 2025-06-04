import { RuntimeConfigOptions } from '@oinone/kunlun-meta';
import { EnabledConfig } from '../../config/config-helper';

/**
 * 多Tab主题
 */
export enum MultiTabTheme {
  tab1 = 'theme1',
  tab2 = 'theme2',
  tab3 = 'theme3',
  tab4 = 'theme4'
}

/**
 * 多标签页配置
 */
export interface MultiTabsConfig extends RuntimeConfigOptions, EnabledConfig {
  /**
   * <h3>是否启用（非运行时）</h3>
   * <p>启用时，需配合mask渲染对应的多标签页管理组件</p>
   * <p>默认: 开启</p>
   */
  enabled?: boolean;
  /**
   * <h3>是否使用内联多标签页</h3>
   * <p>仅在使用默认mask时生效</p>
   */
  inline?: boolean;
  /**
   * <h3>显示模块Logo</h3>
   * <p>默认: 开启</p>
   */
  showModuleLogo?: boolean;

  /**
   * <h3>最多标签页数量</h3>
   * <p>在页面中显示的标签页总数，标签页显示在页面中，但标签页的页面不一定被缓存</p>
   * <p>当打开的标签页数量超过该配置时，将自动关闭最早打开的标签页</p>
   */
  maxCount?: number;

  /**
   * <h3>最多缓存标签页数量</h3>
   * <p>当缓存的标签页数量超过该配置时，将自动清理最早打开的标签页，但不会关闭该标签页。当标签页被重新激活时，页面将重新加载。</p>
   * <p>默认: 10</p>
   */
  maxCacheCount?: number;

  /**
   * <h3>是否启用拖拽排序</h3>
   * <p>默认: 开启</p>
   */
  draggable?: boolean;

  /**
   * <h3>应用首页配置</h3>
   * <p>boolean值与{@link MultiTabsApplicationHomepageConfig#enabled}等效</p>
   */
  homepage?: boolean | MultiTabsApplicationHomepageConfig;

  /**
   * <h3>模块首页配置</h3>
   * <p>boolean值与{@link MultiTabsModuleHomepageConfig#enabled}等效</p>
   */
  moduleHomepage?: boolean | MultiTabsModuleHomepageConfig;

  /**
   * 模块过滤
   */
  filter?: string[];

  /**
   * 主题
   */
  theme?: string;
}

/**
 * 应用首页配置
 */
export interface MultiTabsApplicationHomepageConfig extends RuntimeConfigOptions, EnabledConfig {
  /**
   * <h3>是否启用应用首页</h3>
   * <p>将应用首页进行特殊标记，并永远插入到标签页的首个位置</p>
   * <p>默认: 开启</p>
   */
  enabled?: boolean;
  /**
   * <h3>自动获取应用首页</h3>
   * <p>默认: 开启</p>
   */
  auto?: boolean;
  /**
   * <h3>当前激活标签页为首页时是否自动隐藏</h3>
   * <p>在未使用模块首页时生效</p>
   * <p>默认: 非内联时默认开启，内联时默认关闭</p>
   */
  autoInvisible?: boolean;
}

/**
 * 模块首页配置
 */
export interface MultiTabsModuleHomepageConfig extends RuntimeConfigOptions, EnabledConfig {
  /**
   * <h3>是否启用模块首页</h3>
   * <p>多标签页在切换模块时进行初始化</p>
   * <p>默认: 关闭</p>
   */
  enabled?: boolean;
  /**
   * <h3>自动获取模块首页</h3>
   * <p>默认: 开启</p>
   */
  auto?: boolean;
}
