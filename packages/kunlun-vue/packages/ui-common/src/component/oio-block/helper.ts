import { DEFAULT_NONE_GUTTERS } from './constant';
import { FlexRowJustify, StandardGutterType } from './typing';

export class FlexHelper {
  public static justify(justify: string | FlexRowJustify | undefined): string | undefined {
    if (!justify) {
      return undefined;
    }
    const value = FlexRowJustify[justify.toUpperCase()];
    if (value) {
      if (FlexRowJustify.START === value) {
        return 'flex-start';
      }
      if (FlexRowJustify.END === value) {
        return 'flex-end';
      }
      return value;
    }
  }

  public static convertGutter(gutter: string, defaultGutter?: StandardGutterType): StandardGutterType {
    let gutters = gutter.split(',');
    if (gutters.length === 1) {
      gutters = [gutters[0], gutters[0]];
    }
    let horizontalGutter = Number(gutters[0]?.trim());
    let verticalGutter = Number(gutters[1]?.trim());
    const [defaultHorizontalGutter, defaultVerticalGutter] = defaultGutter || DEFAULT_NONE_GUTTERS;
    if (FlexHelper.isInvalidGutterNumber(horizontalGutter)) {
      horizontalGutter = defaultHorizontalGutter;
    }
    if (FlexHelper.isInvalidGutterNumber(verticalGutter)) {
      verticalGutter = defaultVerticalGutter;
    }
    return [horizontalGutter, verticalGutter];
  }

  private static isInvalidGutterNumber(val: number) {
    return Number.isNaN(val) || val < 0;
  }
}
