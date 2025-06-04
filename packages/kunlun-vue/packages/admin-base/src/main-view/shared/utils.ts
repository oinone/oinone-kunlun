import { useMatched } from '@oinone/kunlun-router';

export interface SharedActionParameter {
  code: string;
}

export class SharedViewUtils {
  public static getPageParameters(): SharedActionParameter | undefined {
    const { matched } = useMatched();
    return matched.segmentParams?.shared;
  }
}
