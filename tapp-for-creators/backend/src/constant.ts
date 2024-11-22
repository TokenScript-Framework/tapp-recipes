import {DynamoDBClientConfigType} from '@aws-sdk/client-dynamodb';
import {SessionStore} from '@fastify/session';
import {InfuraProvider, Wallet} from 'ethers';
import {z} from 'zod';
import DynamoDBSessionStore from './_core/services/dynamoDBSessionStore';
import FileSessionStore from './_core/services/fileSessionStore';
import {env} from './env';

export const MAX_LIMIT = 50;

export const errorResponseSchema = z.object({
  error: z.string(),
});

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const serverProvider = new InfuraProvider(
  env.TARGET_CHAIN_ID,
  env.INFURA_PROJECT_ID
);
export const serverWallet = new Wallet(env.SERVER_WALLET_SK, serverProvider);

export const contracts = {
  1: {
   
  },
  11155111: {
   
  },
  137: {
   
  },
}[env.TARGET_CHAIN_ID];

if (!contracts) {
  throw new Error(`No EAS contracts found for chain ${env.TARGET_CHAIN_ID}`);
}

export const sessionStore = await (():
  | Promise<SessionStore>
  | SessionStore
  | undefined => {
  switch (env.SESSION_STORE) {
    case 'memory':
      return undefined;
    case 'dynamodb': {
      const args: DynamoDBClientConfigType = {
        region: env.DYNAMODB_REGION,
        endpoint: env.DYNAMODB_ENDPOINT,
      };
      if (env.DYNAMODB_ACCESS_KEY_ID && env.DYNAMODB_SECRET_ACCESS_KEY) {
        args.credentials = {
          accessKeyId: env.DYNAMODB_ACCESS_KEY_ID,
          secretAccessKey: env.DYNAMODB_SECRET_ACCESS_KEY,
        };
      }
      return DynamoDBSessionStore.create(args);
    }
    case 'file':
      return new FileSessionStore();
    default:
      throw new Error(`Unknown session store: ${env.SESSION_STORE}`);
  }
})();


export const SUPPORT_TYPES = ['twitter'];

export const oauthConfig: {
  [key: string]: {
    authorizationURL: string;
    tokenURL: string;
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    pkce?: boolean;
    state?: boolean;
    sessionKey?: string;
    customHeaders?: {};
  };
} = {
  twitter: {
    authorizationURL: 'https://twitter.com/i/oauth2/authorize',
    tokenURL: 'https://api.twitter.com/2/oauth2/token',
    clientID: env.TWITTER_CLIENT_ID || 'a25hV1g4X09UVDNncUgwYzNYWDI6MTpjaQ',
    clientSecret:
      env.TWITTER_CLIENT_SECRET ||
      'Yq1Xi-2SnhMC3WNh6GehtSv0DjCztHVE7puASxRP_FsbC3K2I5',
    callbackURL: `${env.CALLBACK_URL_ROOT}/auth/twitter/callback`,
    scope: ['tweet.read', 'users.read'],
    pkce: true,
    state: true,
    sessionKey: 'oauth2:twitter',
    customHeaders: {
      Authorization:
        'Basic ' +
        Buffer.from(
          `${env.TWITTER_CLIENT_ID || 'a25hV1g4X09UVDNncUgwYzNYWDI6MTpjaQ'}:${
            env.TWITTER_CLIENT_SECRET ||
            'Yq1Xi-2SnhMC3WNh6GehtSv0DjCztHVE7puASxRP_FsbC3K2I5'
          }`
        ).toString('base64'),
    },
  },
};

export const verifyURL: {
  [key: string]: string;
} = {
  twitter: 'https://api.twitter.com/2/users/me',
};
