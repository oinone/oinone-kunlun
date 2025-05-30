import { IResponseErrorResult, IResponseResult, NetworkInterceptor } from '../../types';

function translateResp(resp: IResponseErrorResult) {
  const jsonStr = JSON.stringify(resp);
  if (jsonStr.includes('$t(')) {
    const translate = Reflect.get(window, 'translate');
    const translatedResp: IResponseErrorResult = JSON.parse(
      jsonStr.replace(/\$t\((.*?)\)/g, (originStr, matchedStr) => {
        const res = translate?.(matchedStr);
        if (res) {
          return res.replaceAll('"', '\\"');
        }
        return matchedStr;
      })
    );

    resp.errors?.forEach((err, index) => {
      Object.assign(err, translatedResp.errors?.[index]);
    });

    Object.assign(resp, translatedResp);
  }
}

export class TranslateInterceptor implements NetworkInterceptor {
  public success(response: IResponseResult) {
    translateResp(response);
    return true;
  }

  public error(response: IResponseErrorResult) {
    translateResp(response);
    return true;
  }
}
