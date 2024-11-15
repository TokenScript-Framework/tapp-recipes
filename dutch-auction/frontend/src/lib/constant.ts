import { isProd } from './utils';

export const VIEWER_URL = isProd
  ? 'https://viewer.tokenscript.org/'
  : 'https://viewer-staging.tokenscript.org/';
