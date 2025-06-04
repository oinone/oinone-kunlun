import { MultiTabsRuntimeManifestMergedConfigManager, ViewActionCache } from '@oinone/kunlun-engine';
import { GlobalConfig, ViewActionTarget } from '@oinone/kunlun-meta';
import { Router } from '@oinone/kunlun-router';
import { useRouter } from '@oinone/kunlun-vue-router';
import { VueWidget } from '@oinone/kunlun-vue-widget';
import { homepageMaybeRuntimeContext } from '../../util';
import Home from './Home.vue';

export class HomePageWidget extends VueWidget {
  private router!: Router;

  public initialize(props) {
    super.initialize(props);
    this.setComponent(Home);
    return this;
  }

  public async created() {
    this.router = useRouter().router;
    let parameters;

    const { homepage } = GlobalConfig.getConfig();

    if (homepage && homepage.model && homepage.viewActionName) {
      const redirect = await ViewActionCache.get(homepage.model, homepage.viewActionName);
      if (!redirect) {
        throw new Error('Invalid homepage');
      }
      const module = redirect.resModuleDefinition?.name || redirect.moduleDefinition?.name;
      parameters = {
        module,
        model: redirect.model,
        viewType: redirect.viewType,
        action: redirect.name,
        scene: redirect.name,
        target: MultiTabsRuntimeManifestMergedConfigManager.isEnabled(module)
          ? ViewActionTarget.OpenWindow
          : redirect.target
      };
    } else {
      parameters = await homepageMaybeRuntimeContext();

      /**
       * action 执行逻辑拆解，action为总入口
       * 请求返回后
       * createOinone() // 数据处理 供后续流程使用
       * genModel(); // 构建模型 kunlun/metadata kunlun/cache 提供能力
       * genModule(); // 构建应用 kunlun/metadata 提供能力
       * genView(); // 实例化页面 kunlun/spi kunlun/widget kunlun/cache  kunlun/theme提供能力
       * genMask(); // 实例化模板 kunlun/spi kunlun/widget 提供能力
       * genRoute(); // 路由条状相关api kunlun/route 提供能力
       * action请求返回后
       * const Oinone  = genRoute(genMask(genView(genModule((genModel(createOinone(Action data)))))))
       * Oinone就具备 当前页所有的原始数据 model相关能力 module相关能力
       * */
    }
    this.router.push({
      segments: [
        {
          path: 'page',
          extra: { preserveParameter: false },
          parameters
        }
      ]
    });
  }
}
