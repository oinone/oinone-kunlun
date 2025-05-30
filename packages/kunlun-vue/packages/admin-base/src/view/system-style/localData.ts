import { SideBarThemeColor, SideBarTheme, MultiTabTheme, genStaticPath, translateValueByKey } from '@kunlun/engine';
import { DefaultThemeName } from '@kunlun/theme';

const IMAGE_BASE_URL = 'x-oss-process=image/resize,m_lfit,h_800';

enum ThemeType {
  default = SideBarThemeColor.default,
  dark = SideBarThemeColor.dark
}

export const hostImage = () => genStaticPath('computer-samples.png?x-oss-process=image/resize,m_lfit,h_800');
export const lightMode = () => genStaticPath('light-mode@2x.png?x-oss-process=image/resize,m_lfit,h_800');
export const darkMode = () => genStaticPath('dark-mode@2x.png?x-oss-process=image/resize,m_lfit,h_800');

interface ReturnValue<T> {
  style: T;
  image: string;
  title: string;
}

class SystemThemeConfig {
  private static generateImages(names: string[]): string[] {
    return names.map((name) => genStaticPath(`${name}?${IMAGE_BASE_URL}`));
  }

  private static generateLayoutConfig<T>(styles: T[], titles: string[], images: string[]): ReturnValue<T>[] {
    return styles.map((style, index) => ({
      style,
      image: images[index],
      title: translateValueByKey(titles[index])
    }));
  }

  private static menuColorConfig() {
    return SystemThemeConfig.generateLayoutConfig(
      [SideBarThemeColor.default, SideBarThemeColor.dark],
      [translateValueByKey('月光白'), translateValueByKey('静谧黑')],
      SystemThemeConfig.generateImages([`side-bar-default-color.png`, `side-bar-dark-color.png`])
    );
  }

  private static sideBarConfig(type: ThemeType) {
    return SystemThemeConfig.generateLayoutConfig(
      [
        SideBarTheme.side1,
        SideBarTheme.side2,
        SideBarTheme.side3,
        SideBarTheme.side4,
        SideBarTheme.side5,
        SideBarTheme.side6
      ],
      [
        translateValueByKey('样式一'),
        translateValueByKey('样式二'),
        translateValueByKey('样式三'),
        translateValueByKey('样式四'),
        translateValueByKey('样式五'),
        translateValueByKey('样式六')
      ],
      SystemThemeConfig.generateImages([
        `${type}-sidebar-1.png`,
        `${type}-sidebar-2.png`,
        `${type}-sidebar-3.png`,
        `${type}-sidebar-4.png`,
        `${type}-sidebar-5.png`,
        `${type}-sidebar-6.png`
      ])
    );
  }

  private static TabConfig(type: ThemeType, inline = false) {
    const inlineImages = [
      `${type}-tab-inline-1.jpg`,
      `${type}-tab-inline-2.jpg`,
      `${type}-tab-inline-3.jpg`,
      `${type}-tab-inline-4.jpg`
    ];

    const outImages = [`${type}-tab-1.jpg`, `${type}-tab-2.jpg`, `${type}-tab-3.jpg`, `${type}-tab-4.jpg`];
    return SystemThemeConfig.generateLayoutConfig(
      [MultiTabTheme.tab1, MultiTabTheme.tab2, MultiTabTheme.tab3, MultiTabTheme.tab4],
      ['样式一', '样式二', '样式三', '样式四'],
      SystemThemeConfig.generateImages(inline ? inlineImages : outImages)
    );
  }

  public get previewImages() {
    return {
      // 深色 - 大
      [DefaultThemeName.DARK_LARGE]: genStaticPath('表格页large-black.png?x-oss-process=image/resize,m_lfit,h_800'),
      // 深色 - 中
      [DefaultThemeName.DARK_MEDIUM]: genStaticPath('表格页middle-black.png?x-oss-process=image/resize,m_lfit,h_800'),
      // 深色 - 小
      [DefaultThemeName.DARK_SMALL]: genStaticPath('表格页small-black.png?x-oss-process=image/resize,m_lfit,h_800'),

      // 浅色 - 大
      [DefaultThemeName.DEFAULT_LARGE]: genStaticPath('表格页large.png?x-oss-process=image/resize,m_lfit,h_800'),

      // 浅色 - 中
      [DefaultThemeName.DEFAULT_MEDIUM]: genStaticPath('表格页middle.png?x-oss-process=image/resize,m_lfit,h_800'),

      // 浅色 - 小
      [DefaultThemeName.DEFAULT_SMALL]: genStaticPath('表格页small.png?x-oss-process=image/resize,m_lfit,h_800')
    };
  }

  public get defaultMenuColors() {
    return SystemThemeConfig.menuColorConfig();
  }

  public get darkMenuColors() {
    return SystemThemeConfig.menuColorConfig();
  }

  public get DefaultSideBarThemes() {
    return SystemThemeConfig.sideBarConfig(ThemeType.default);
  }

  public get darkSideBarThemes() {
    return SystemThemeConfig.sideBarConfig(ThemeType.dark);
  }

  public defaultMultiTabThemes(inline = false) {
    return SystemThemeConfig.TabConfig(ThemeType.default, inline);
  }

  public darkMultiTabThemes(inline = false) {
    return SystemThemeConfig.TabConfig(ThemeType.dark, inline);
  }
}

export const localSystemTheme = new SystemThemeConfig();
