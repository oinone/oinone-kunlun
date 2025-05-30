import { taggedConstraint } from 'inversify';
import * as METADATA_KEY from './metadata-keys';

export const autowiredConstraint = taggedConstraint(METADATA_KEY.AUTOWIRED);
