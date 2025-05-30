export class UrlHelper {
  private static readonly PATH_SPLIT = '/';

  private static readonly EMPTY = '';

  private constructor() {
    // reject create object
  }

  public static absolutePath(path: string | undefined): string {
    if (!path) {
      return UrlHelper.PATH_SPLIT;
    }
    if (path.charAt(0) === this.PATH_SPLIT) {
      return path;
    }
    return `${UrlHelper.PATH_SPLIT}${path}`;
  }

  public static relativePath(path: string | undefined): string {
    if (!path) {
      return UrlHelper.EMPTY;
    }
    if (path.charAt(0) === this.PATH_SPLIT) {
      return path.substring(1);
    }
    return path;
  }

  public static append(base: string | undefined, ...paths: string[]): string {
    const res = base || UrlHelper.EMPTY;
    const path = paths
      .map((v) => UrlHelper.relativePath(v))
      .filter((v) => !!v)
      .join(UrlHelper.PATH_SPLIT);
    if (res) {
      if (res === UrlHelper.PATH_SPLIT) {
        return `${res}${path}`;
      }
      return `${res}/${path}`;
    }
    return path;
  }

  public static appendBasePath(path: string, absolute = true) {
    const basePath = absolute
      ? UrlHelper.absolutePath(process.env.BASE_PATH)
      : UrlHelper.relativePath(process.env.BASE_PATH);
    let res: string;
    if ((absolute ? UrlHelper.absolutePath(path) : UrlHelper.relativePath(path)).startsWith(basePath)) {
      res = path;
    } else {
      res = UrlHelper.append(basePath, path);
    }
    return res;
  }
}
