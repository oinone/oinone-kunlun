import { ReturnPromise } from '@kunlun/shared';
import { GQLFragment } from '../typing';
import responseParametersToString from './response';

export default function fragmentsToString(fragments: ReturnPromise<GQLFragment>[]): Promise<string> {
  return Promise.all(
    fragments.map(async (v) => {
      const fragment = await v;
      if (typeof fragment === 'string') {
        return fragment;
      }
      return `fragment ${fragment.name} on ${fragment.definition} {${await responseParametersToString(
        fragment.parameters
      )}}`;
    })
  ).then((values) => values.filter((v) => v != null).join(''));
}
