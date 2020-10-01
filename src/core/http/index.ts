import { envInt, envString, isDev } from '@util/env';
import connectRedis from 'connect-redis';
import express, { Express } from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import { createClient as createRedisClient } from 'redis';
import { TwitterRouter } from './routes/twitterRouter';

export class FischHTTP {
  private server!: Express;
  private host!: string;
  private port = 80;

  private twitterRouter!: TwitterRouter;

  async start(): Promise<void> {
    this.server = express();
    const { value: redisHost } = envString('REDIS__HOST');
    const { value: redisPort } = envInt('REDIS__PORT');

    this.host = envString('APP__HOST').value;
    this.port = envInt('APP__PORT').value;

    const RedisStore = connectRedis(expressSession);

    const redisClient = createRedisClient({
      host: redisHost,
      port: redisPort,
    });

    redisClient.on('error', (err) => {
      throw new Error(err);
    });

    passport.serializeUser(function (user, done) {
      done(null, user);
    });

    passport.deserializeUser(function (user, done) {
      done(null, user);
    });

    this.server.use(passport.initialize());
    this.server.use(
      expressSession({
        store: new RedisStore({ host: redisHost, port: redisPort, client: redisClient }),
        name: '_fischbotSession',
        secret: envString('REDIS__SECRET').value,
        resave: false,
        cookie: { secure: false, maxAge: 60000 },
        saveUninitialized: true,
      }),
    );

    this.twitterRouter = new TwitterRouter();
    await this.twitterRouter.start();
    this.server.use('/twitter', this.twitterRouter.router);

    this.server.get('/', (_, res) => {
      res.status(404);
    });

    this.server.listen(this.port);
  }

  get address(): string {
    if (isDev()) {
      return `http://localhost:${this.port}`;
    }

    return `http://${this.host}:${this.port}`;
  }
}
