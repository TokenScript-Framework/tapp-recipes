import {DynamoDB} from '@aws-sdk/client-dynamodb';
import test from 'ava';
import {ethers} from 'ethers';
import {FastifyReply, FastifyRequest} from 'fastify';
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from 'testcontainers';
import {Application} from '../../../src/_core/application';
import DynamoDBSessionStore from '../../../src/_core/services/dynamoDBSessionStore';
import {Controller, SecurityFilterRule} from '../../../src/_core/type';
import {siweLogin, testRequest} from '../../_utils';

function handler1(request: FastifyRequest, reply: FastifyReply) {
  reply.code(200).send('handler1');
}

async function handler2(request: FastifyRequest, reply: FastifyReply) {
  reply.code(201).send('handler2');
}

function currentUserHandler(request: FastifyRequest, reply: FastifyReply) {
  reply.code(200).send(request.user);
}

const signedWallet1 = new ethers.Wallet(
  '0x94d7c5a5a58e21d8b540984442724df1d7d5ca0aaae3ac76041436b2951cf5a3'
);
const signedWallet2 = new ethers.Wallet(
  '0xc504832fde64d103fd6c1bb4fc3a8c9295b2e3be23d11cc5b7021e29fc1d0d8d'
);

const controllers: Controller[] = [
  {
    prefix: '/',
    actions: [
      {path: '/test', method: 'get', handler: handler1},
      {path: '/current-user', method: 'all', handler: currentUserHandler},
    ],
  },
  {
    prefix: '/sub',
    actions: [{path: '/test', method: 'post', handler: handler2}],
  },
  {
    prefix: '/protected',
    actions: [{path: '/test', method: 'get', handler: handler1}],
  },
  {
    prefix: '/protected',
    actions: [{path: '/test', method: 'post', handler: handler2}],
  },
  {
    prefix: '/banned-all',
    actions: [{path: '/test', method: 'all', handler: handler1}],
  },
];

const securityRules: SecurityFilterRule[] = [
  {pattern: /^\/protected/, httpMethod: 'post'},
  {pattern: /^\/banned-all/},
  {pattern: /^\/current-user/},
];
const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZHVtbXkiLCJpYXQiOjE2Njg1ODk4MDN9.drk0s1kubyrs_v4CfhiJ5K7vKRQzrFdef8RJUlJz-_4';

const server = new Application()
  .withSession({
    secret: jwt,
    cookie: {secure: false, maxAge: 3600},
  })
  .controllers(controllers)
  .securityRules(securityRules)
  .build();

let dockerEnvornment: StartedDockerComposeEnvironment;

test.before(async () => {
  dockerEnvornment = await new DockerComposeEnvironment(
    '.',
    'compose.yaml'
  ).up();
});

test.after.always(async () => {
  if (dockerEnvornment) {
    await dockerEnvornment.down({removeVolumes: true});
  }
  server.close();
});

test('route should work', async t => {
  await testRequest(
    server,
    {
      method: 'GET',
      url: '/test',
    },
    {statusCode: 200, body: 'handler1'},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: '/sub/test',
    },
    {statusCode: 201, body: 'handler2'},
    t
  );
});

test('sessionVerifier should work', async t => {
  const randomWallet = ethers.Wallet.createRandom();
  const loggedSessionId = await siweLogin(server, randomWallet);
  await testRequest(
    server,
    {
      method: 'GET',
      url: '/protected/test',
    },
    {statusCode: 200, body: 'handler1'},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: '/protected/test',
    },
    {statusCode: 401},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: '/protected/test',
      headers: {Authorization: `Bearer ${jwt}bad`},
    },
    {statusCode: 401},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: '/protected/test',
      cookies: {sessionId: loggedSessionId},
    },
    {statusCode: 201, body: 'handler2'},
    t
  );

  for (const method of ['GET', 'POST', 'DELETE']) {
    await testRequest(
      server,
      {
        method: method as any,
        url: '/banned-all/test',
      },
      {statusCode: 401},
      t
    );
  }

  for (const method of ['GET', 'POST', 'DELETE']) {
    await testRequest(
      server,
      {
        method: method as any,
        url: '/banned-all/test',
        cookies: {sessionId: loggedSessionId},
      },
      {statusCode: 200},
      t
    );
  }
});

test('request.user should work in sessionVerifier', async t => {
  const randomWallet = ethers.Wallet.createRandom();
  const loggedSessionId = await siweLogin(server, randomWallet);
  await testRequest(
    server,
    {
      method: 'GET',
      url: '/current-user',
      cookies: {sessionId: loggedSessionId},
    },
    {
      statusCode: 200,
      bodyAssertion: (body: string) => {
        const bodyJson = JSON.parse(body);
        return (
          bodyJson.name === randomWallet.address &&
          bodyJson.loginMethod === 'siwe'
        );
      },
    },
    t
  );
});

test('/personal-information should work when login with session', async t => {
  const randomWallet = ethers.Wallet.createRandom();
  const loggedSessionId = await siweLogin(server, randomWallet);
  await testRequest(
    server,
    {
      method: 'GET',
      url: '/personal-information',
      cookies: {sessionId: loggedSessionId},
    },
    {
      statusCode: 200,
      bodyAssertion: (body: string) =>
        JSON.parse(body).address === randomWallet.address,
    },
    t
  );
});

test('signatureVerifier should work', async t => {
  const randomWallet = ethers.Wallet.createRandom();
  const result = {test: 'test'};
  const messageToSign = JSON.stringify(result);
  const signedMessage1 = await signedWallet1.signMessage(messageToSign);
  const signedMessage2 = await signedWallet2.signMessage(messageToSign);
  const badSignedMessage = await randomWallet.signMessage(messageToSign);

  await testRequest(
    server,
    {
      method: 'post',
      url: '/protected/test',
      body: {message: messageToSign, signature: badSignedMessage},
    },
    {statusCode: 401},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: '/protected/test',
      body: {message: messageToSign, signature: signedMessage1},
    },
    {statusCode: 201},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: '/protected/test',
      body: {message: messageToSign, signature: signedMessage2},
    },
    {statusCode: 201},
    t
  );
});

test('request.user should work in signatureVerifier', async t => {
  const result = {test: 'test2'};
  const messageToSign = JSON.stringify(result);
  const signedMessage1 = await signedWallet1.signMessage(messageToSign);

  await testRequest(
    server,
    {
      method: 'post',
      url: '/current-user',
      body: {message: messageToSign, signature: signedMessage1},
    },
    {
      statusCode: 200,
      bodyAssertion: body => {
        const bodyJson = JSON.parse(body);
        return (
          bodyJson.name === signedWallet1.address &&
          bodyJson.loginMethod === 'signature'
        );
      },
    },
    t
  );
});

test('dynamodb session store should work', async t => {
  const dynamoDbOptions = {
    endpoint: 'http://localhost:8000',
    region: 'local',
    credentials: {
      accessKeyId: 'aaaaa',
      secretAccessKey: 'bbbbb',
    },
  };
  const server = new Application()
    .withSession({
      secret: 'a secret with minimum length of 32 characters',
      cookie: {secure: 'auto', maxAge: 3600 * 1000},
      store: await DynamoDBSessionStore.create(dynamoDbOptions),
    })
    .controllers(controllers)
    .securityRules(securityRules)
    .build();
  const randomWallet1 = ethers.Wallet.createRandom();
  const randomWallet2 = ethers.Wallet.createRandom();
  const randomWallet3 = ethers.Wallet.createRandom();
  const sessionId1 = await siweLogin(server, randomWallet1);
  const sessionId2 = await siweLogin(server, randomWallet2);
  const sessionId3 = await siweLogin(server, randomWallet3);

  await testRequest(
    server,
    {
      method: 'GET',
      url: '/current-user',
      cookies: {sessionId: sessionId1},
    },
    {
      statusCode: 200,
      bodyAssertion: (body: string) => {
        const bodyJson = JSON.parse(body);
        return (
          bodyJson.name === randomWallet1.address &&
          bodyJson.loginMethod === 'siwe'
        );
      },
    },
    t
  );
  await testRequest(
    server,
    {
      method: 'GET',
      url: '/current-user',
      cookies: {sessionId: sessionId2},
    },
    {
      statusCode: 200,
      bodyAssertion: (body: string) => {
        const bodyJson = JSON.parse(body);
        return (
          bodyJson.name === randomWallet2.address &&
          bodyJson.loginMethod === 'siwe'
        );
      },
    },
    t
  );
  await testRequest(
    server,
    {
      method: 'GET',
      url: '/current-user',
      cookies: {sessionId: sessionId3},
    },
    {
      statusCode: 200,
      bodyAssertion: (body: string) => {
        const bodyJson = JSON.parse(body);
        return (
          bodyJson.name === randomWallet3.address &&
          bodyJson.loginMethod === 'siwe'
        );
      },
    },
    t
  );

  const dynamoDb = new DynamoDB(dynamoDbOptions);
  const items = await dynamoDb.scan({
    TableName: 'sessions',
  });

  t.is(items.Count, 3);
});
