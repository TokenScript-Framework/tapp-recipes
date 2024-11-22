import pino from 'pino';
import {env} from '../env';

export const LOGGER = pino({level: env.LOG_LEVEL});

const VERSION = '0.1.0';

export const API_INFO = {
  title: 'Twitter-Creators',
  description: 'The backend for twitter creators',
  version: VERSION,
};

export const LOGO = `
  _______          _ _   _              ____                _
 |__   __|        (_) | | |            / ___|_ __ ___  __ _| |_ ___  _ __
    | |_      __ _ _| |_| |_ ___ _ __ | |   | '__/ _ \\/ _\` | __/ _ \\| '__|
    | \\ \\ /\\ / / | | __| __/ _ \\ '__|| |___| | |  __/ (_| | || (_) | |
    | |\\ V  V /| | | |_| ||  __/ |    \\____|_|  \\___|\\__,_|\\__\\___/|_|
    |_| \\_/\\_/ |_|\\__|\\__\\___|_|                                v${VERSION}
`;
