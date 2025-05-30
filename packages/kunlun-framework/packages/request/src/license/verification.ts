import { setWatermark } from '../watermark';
import { FIVE, ONE, THREE, TWO, ZERO } from './number';
import { RequestEncryptHelper } from './RequestEncryptHelper';
import { RequestError } from './RequestError';

/* 10510010 */

const c1 = ONE + ZERO + FIVE + ONE + ZERO + ZERO + ONE + ZERO;

/* 10510012 */

const c2 = ONE + ZERO + FIVE + ONE + ZERO + ZERO + ONE + TWO;

/* 10510013 */
const c3 = ONE + ZERO + FIVE + ONE + ZERO + ZERO + ONE + THREE;

export function verify(result: {
  data?: {
    __pl__?: unknown;
    __ps__?: unknown;
  };
}): void {
  const pl = result?.data?.__pl__;
  const ps = result?.data?.__ps__;

  if (!pl || !ps) {
    return;
  }

  if (!(typeof pl === 'string')) {
    throw new RequestError();
  }
  if (!(typeof ps === 'string')) {
    throw new RequestError();
  }
  let data: { code: string; message: string };
  try {
    data = JSON.parse(RequestEncryptHelper.decrypt(ps, pl));
  } catch (e) {
    throw new RequestError();
  }
  if (!data || !data.code || data.code === c1) {
    return;
  }
  if ([c2, c3].includes(data.code)) {
    setWatermark(data.code, data.message);
    return;
  }
  throw new RequestError();
}
