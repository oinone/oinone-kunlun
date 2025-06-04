import { UrlHelper } from '@oinone/kunlun-shared';
import { IResponseResult, NetworkInterceptor } from '../../types';

export class ActionRedirectInterceptor implements NetworkInterceptor {
  public success(response: IResponseResult) {
    const action = response.extensions?.extra?.action;
    if (action && typeof action === 'object') {
      const { moduleName, viewType, model, name, target } = action as Record<string, string>;
      if (!moduleName || !viewType || !model || !name) {
        return true;
      }
      const parameters = [`module=${moduleName}`, `viewType=${viewType}`, `model=${model}`, `action=${name}`];
      if (target) {
        parameters.push(`target=${target}`);
      }
      if (this.redirectToPage(parameters)) {
        return false;
      }
    }
    return true;
  }

  public redirectToPage(parameters: string[]): boolean {
    const href = `${origin}/${UrlHelper.appendBasePath('page', false)};${parameters.join(';')}`;
    window.location.href = href;
    return true;
  }
}
