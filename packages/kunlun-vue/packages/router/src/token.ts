import { ComputedRef } from 'vue';
import { ActivatedRoute } from '@kunlun/router';

import { genToken } from '@kunlun/vue-widget';

const __DEV__ = process.env.NODE_ENV === 'development';

export const ACTIVATED_ROUTE_TOKEN = genToken<ComputedRef<ActivatedRoute>>(
  __DEV__ ? 'router view location matched' : 'rvlm'
);
