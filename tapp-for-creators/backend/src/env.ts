import {createEnv} from '@t3-oss/env-core';
import dotenv from 'dotenv';
import {ethers} from 'ethers';
import {z} from 'zod';

dotenv.config();

const DEFAULT_FASTIFY_PORT = 3006;
const DEFAULT_FASTIFY_ADDRESS = '127.0.0.1';

export const env = createEnv({
  clientPrefix: '',
  server: {
    NODE_ENV: z.enum(['mainnet', 'stage', 'testnet', 'test']).default('stage'),
    SESSION_SECRET: z
      .string()
      .default('a secret with minimum length of 32 characters'),
    FASTIFY_PORT: z.coerce.number().default(DEFAULT_FASTIFY_PORT),
    FASTIFY_ADDRESS: z.string().default(DEFAULT_FASTIFY_ADDRESS),
    LOG_LEVEL: z.string().default('debug'),
    DB_HOST: z.string().default('127.0.0.1'),
    DB_PORT: z.coerce.number().default(5432),
    DB_USER: z.string().default('eevy_admin'),
    DB_PASSWORD: z.string().default('admin'),
    DB_DATABASE: z.string().default('eevy'),
    INFURA_PROJECT_ID: z.string().optional(),
    SERVER_WALLET_SK: z.string(),
    CHAIN_ID: z.coerce.number().default(1337),
    TARGET_CHAIN_ID: z.coerce.number().default(11155111),
    DOMAIN: z
      .string()
      .default(`http://${DEFAULT_FASTIFY_ADDRESS}:${DEFAULT_FASTIFY_PORT}`),
    SESSION_TTL_IN_SECONDS: z.coerce.number().default(60 * 60), // 1 hour
    DYNAMODB_SESSION_STORE_TABLE: z.string().default('sessions'),
    SESSION_STORE: z.enum(['memory', 'dynamodb', 'file']).default('memory'),
    DYNAMODB_ENDPOINT: z.string().optional(),
    DYNAMODB_REGION: z.string().optional(),
    DYNAMODB_ACCESS_KEY_ID: z.string().optional(),
    DYNAMODB_SECRET_ACCESS_KEY: z.string().optional(),
    SECRET_TTL: z.coerce.number().default(300 * 1000), // default to 5 minutes
    PROJECT_API_KEY: z.string(),
    ROOT_URL_PREFIX: z.string().default('http://127.0.0.1:3000'), //frontend
    WALLET_ADDRESS_WHITELIST: z
      .string()
      .optional()
      .transform((val) => val?.split(",").map(ethers.getAddress)),
    CALLBACK_URL_ROOT: z.string().default('http://127.0.0.1:3106'),
    TWITTER_CLIENT_ID: z.string().default('a25hV1g4X09UVDNncUgwYzNYWDI6MTpjaQ'),
    TWITTER_CLIENT_SECRET: z
      .string()
      .default('Yq1Xi-2SnhMC3WNh6GehtSv0DjCztHVE7puASxRP_FsbC3K2I5'),
  },
  client: {},
  runtimeEnv: process.env,
});
