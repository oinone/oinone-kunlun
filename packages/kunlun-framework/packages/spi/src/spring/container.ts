import { Container } from 'inversify';

export const container = new Container();
container.options.skipBaseClassChecks = true;
