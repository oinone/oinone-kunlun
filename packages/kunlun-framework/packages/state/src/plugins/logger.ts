import { StoreDefinition } from '../store/typing';

export function useOioLogger() {
  return (store: StoreDefinition) => {
    const logger = console;

    let prevState = JSON.parse(JSON.stringify(store.$state));

    if (typeof logger !== 'undefined') {
      store.subscribeAction((action, state) => {
        const nextState = JSON.parse(JSON.stringify(state));

        const message = `'action' ${action.type}`;

        startMessage(logger, message, true);

        logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', prevState);
        logger.log('%c action', 'color: #03A9F4; font-weight: bold', action);
        logger.log('%c next state', 'color: #4CAF50; font-weight: bold', nextState);

        endMessage(logger);

        prevState = nextState;
      });
    }
  };
}

function startMessage(logger, message, collapsed) {
  const _startMessage = collapsed ? logger.groupCollapsed : logger.group;

  try {
    _startMessage.call(logger, message);
  } catch (e) {
    logger.log(message);
  }
}

function endMessage(logger) {
  try {
    logger.groupEnd();
  } catch (e) {
    logger.log('—— log end ——');
  }
}
