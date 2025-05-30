import { DEFAULT_GUTTERS } from '../component/oio-block/constant';
import { FlexHelper } from '../component/oio-block/helper';
import { StandardGutterType } from '../component/oio-block/typing';

export class LayoutHelper {
  public static convertGutter(gutter: string, defaultGutter?: StandardGutterType): StandardGutterType {
    return FlexHelper.convertGutter(gutter, defaultGutter || DEFAULT_GUTTERS);
  }
}
