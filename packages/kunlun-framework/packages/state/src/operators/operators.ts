import { Subscribable as ASubscribable } from 'rxjs';

export { BehaviorSubject, Subject, Subscription, Observable, of } from 'rxjs';
export {
  pairwise,
  filter,
  distinctUntilChanged,
  map,
  take,
  last,
  concatAll,
  concatMap,
  switchAll,
  switchMap,
  debounceTime,
  tap
} from 'rxjs/operators';

export type Subscribable<T> = ASubscribable<T>;
