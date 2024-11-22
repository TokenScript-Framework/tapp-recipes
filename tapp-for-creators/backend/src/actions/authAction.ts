import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {Action} from '../_core/type';

import axios from 'axios';
import z from 'zod';
import {verifyURL} from '../constant';
import { userInfo } from 'os';

export const verifyAuth: Action = {
  path: '/verify/:type',
  method: 'get',
  options: {
    schema: {
      params: z.object({
        type: z.string(),
      }),
      querystring: z.object({accessToken: z.string()}),
    },
  },
  handler: verifyHandler,
};

async function verifyHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {type} = request.params as {type: string};
  const {accessToken} = request.query as {
    accessToken: string;
  };

  try {
    const user = await verifyAccessToken(type, accessToken);
    console.log(user);
    return reply.status(201).send(user);
  } catch (e) {
    return reply.status(400).send({error: 'Invalid accessToken'});
  }
}

async function verifyAccessToken(type: string, accessToken: string) {
  try {
    const res = await axios.get(verifyURL[`${type}`], {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(res.data);
    let result = {};
    switch (type) {
      case 'discord':
        result = {
          value: `${res.data.username}(${res.data.id})`,
          email: res.data.email,
        };
        break;
      case 'github':
        result = {
          value: `${res.data.login}(${res.data.id})`,
          email: res.data.email,
        };
        break;
      default: //twitter
        result = {
          value: `${res.data.data.username}(${res.data.data.id})`,
          email: res.data.data.email,
          id: res.data.data.id,
          name: res.data.data.name,
          username: res.data.data.username
        };
        break;
    }

    //twitter

    return result;
  } catch (err: any) {
    throw new Error(err);
  }
}
