import { generatorViewActionQueryParameter, ViewActionCache } from '@kunlun/engine';
import { getRouterInstance, Router } from '@kunlun/router';
import {
  getUnauthorizedAction,
  unauthorizedActionName,
  urlHomepageModelName
} from './unauthorized-action';
import { IURLAction, ViewActionTarget } from "@kunlun/meta";

export async function gotoHomepage(module: string, moduleName: string, urlHomePage?: IURLAction, router: Router = getRouterInstance()) {
  let homepage = await ViewActionCache.getHomepage(module);
  if (!homepage) {
    if (urlHomePage && urlHomePage.target === ViewActionTarget.Inner) {
      homepage = getUnauthorizedAction({
        moduleName,
        model: urlHomepageModelName,
        target: urlHomePage.target,
        name: encodeURI(urlHomePage.url)
      });
    } else if (urlHomePage && urlHomePage.target === ViewActionTarget.OpenWindow) {
      window.open(urlHomePage.url, '_blank');
      return false;
    } else {
      homepage = getUnauthorizedAction({
        moduleName,
        name: unauthorizedActionName
      });
    }
  }

  router.push({
    segments: [
      {
        path: 'page',
        extra: { preserveParameter: false },
        parameters: generatorViewActionQueryParameter(homepage, { moduleName, usingLastedUrlParameters: false })
      }
    ]
  });
  return true;
}
