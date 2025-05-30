import { useGlobalEnv } from '@kunlun/environment';
import { useMatched } from '@kunlun/router';
import { StringHelper, uniqueKeyGenerator } from '@kunlun/shared';
import { SPI } from '@kunlun/spi';
import { Widget } from '@kunlun/vue-widget';
import { MaskWidget } from '../../../basic';
import { DEFAULT_PREFIX } from '../../../theme';
import { BaseMaskLayoutWidget } from '../BaseMaskLayoutWidget';

@SPI.ClassFactory(MaskWidget.Token({ dslNodeType: 'content' }))
export class MaskContentWidget extends BaseMaskLayoutWidget {
  private static readonly id = `${DEFAULT_PREFIX}-content-${uniqueKeyGenerator()}`;

  @Widget.Reactive()
  public get id(): string {
    return MaskContentWidget.id;
  }

  @Widget.Reactive()
  public get classNames(): string[] | undefined {
    return StringHelper.append(['k-layout-content oio-scrollbar'], super.classNames);
  }

  protected mounted() {
    useGlobalEnv().contentSelector = `#${this.id}`;

    const { getMatched$ } = useMatched();
    getMatched$().subscribe(() => {
      /**
       * 当视图滚动到右侧的时候，再切换到其他页面，会导致其他页面也滚动到的右侧
       */
      const node = document.querySelector('.k-layout-content.oio-scrollbar') as HTMLElement;

      if (node) {
        if (node.scrollLeft > 0) {
          node.scrollLeft = 0;
        }
      }
    });
  }
}
