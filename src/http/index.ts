import fastify, { FastifyInstance } from 'fastify';
import { ensureEnvInt } from '../util/ensureEnv';

const server = fastify();

server.get('/ping', async () => {
  return 'pong\n';
});

export class FischHTTP {
  httpServer: FastifyInstance;

  constructor() {
    this.httpServer = fastify();
  }

  listen(): void {
    const { error, value: port } = ensureEnvInt('APP__PORT');

    if (error) {
      throw new Error(error);
    }
    if (!port) {
      throw new Error(`Invalid Port: "${port}"`);
    }

    this.httpServer.listen(port, (err, address) => {
      if (err) {
        throw new Error(err.message);
      }

      console.log(`Server listening at ${address}`);
    });
  }
}
