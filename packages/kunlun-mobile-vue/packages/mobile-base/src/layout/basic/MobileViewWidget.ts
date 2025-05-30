import { IViewProps, ListVM, ObjectVM } from '@kunlun/engine';
import { Constructor } from '@kunlun/shared';
import { SPI, SPIOperator, SPISelectorFactory, SPISingleSelector, SPITokenFactory } from '@kunlun/spi';
import { IViewFilterOptions, ViewWidget } from '@kunlun/vue-widget';
import { MobileSPIOptions } from '../../basic';
import { getMaskTagManagerInstance } from './register';
// import { MASK_WIDGET_STORAGE_KEY } from './token';

export interface IMobileViewFilterOptions extends IViewFilterOptions, MobileSPIOptions {}

@SPI.Base('MobileView', ['id', 'name', 'type', 'model', 'widget', 'tagName'])
export abstract class MobileViewWidget<
  ViewData = any,
  VP extends IViewProps = any,
  VM extends ListVM | ObjectVM = any
> extends ViewWidget<ViewData, VP, VM> {
  public static Token: SPITokenFactory<IMobileViewFilterOptions>;

  public static Selector: SPISingleSelector<IMobileViewFilterOptions, Constructor<MobileViewWidget>>;
}

// function installMobileViewWidget() {
//   MobileViewWidget.Token = (options) => {
//     const { tagName } = options;
//     if (tagName) {
//       let tagNames: string[];
//       if (Array.isArray(tagName)) {
//         tagNames = tagName;
//       } else {
//         tagNames = [tagName];
//       }
//       for (const tag of tagNames) {
//         const maskTagManager = getMaskTagManagerInstance();
//         if (maskTagManager && !maskTagManager.isInternalWidget(tag)) {
//           maskTagManager.register(tag);
//         }
//       }
//     }
//     const maskOptions = {
//       ...options,
//       dslNodeType: tagName
//     };
//     delete maskOptions.tagName;
//     return SPISelectorFactory.GeneratorToken(MASK_WIDGET_STORAGE_KEY, maskOptions);
//   };
//
//   MobileViewWidget.Selector = (options) => {
//     const { tagName } = options;
//     let maskOptions: IViewFilterOptions;
//     if (tagName) {
//       maskOptions = {
//         ...options,
//         dslNodeType: tagName
//       };
//       delete maskOptions.tagName;
//     } else {
//       maskOptions = options;
//     }
//     const a = SPIOperator.selector(MASK_WIDGET_STORAGE_KEY, maskOptions);
//     console.log(a);
//     return a as any;
//   };
// }

// installMobileViewWidget();
