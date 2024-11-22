import {verifyAuth} from './actions/authAction';
import {Controller, SecurityFilterRule} from './_core/type';

export const controllers: Controller[] = [
  {
    prefix: 'auth',
    actions: [verifyAuth],
  },
];

export const securityRules: SecurityFilterRule[] = [
];
