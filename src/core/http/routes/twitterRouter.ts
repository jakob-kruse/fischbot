import { Router } from 'express';
import passport from 'passport';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { http, kernel } from '@kernel';
import { envString } from '@util/env';

export class TwitterRouter {
  private _router!: Router;
  async start(): Promise<void> {
    const { value: consumerToken } = envString('APP__TWITTER_CONSUMER_TOKEN');

    const { value: consumerTokenSecret } = envString('APP__TWITTER_CONSUMER_TOKEN_SECRET');
    const callbackURL = `${http.address}/twitter/callback`;

    passport.use(
      new TwitterStrategy(
        {
          consumerKey: consumerToken,
          consumerSecret: consumerTokenSecret,
          callbackURL,
        },
        async (accessToken, accessTokenSecret, _, done) => {
          const { connection, error } = await kernel.twitter.createEmptyConnection(accessToken, accessTokenSecret);

          if (error) {
            done(null, null);
            return;
          }

          done(null, { id: connection?.id });
        },
      ),
    );

    const TwitterRouter = Router();

    TwitterRouter.get('/start', passport.authenticate('twitter'));

    TwitterRouter.get(
      '/callback',
      passport.authenticate('twitter', {
        successRedirect: '/twitter/success',
        failureRedirect: '/twitter/failure',
        failureFlash: true,
      }),
    );

    TwitterRouter.get('/success', async (req, res) => {
      const connectionId: number = parseInt(req?.session?.passport?.user?.id);
      if (!connectionId || isNaN(connectionId)) {
        res.send('Session not found, please start again!');
        return;
      }

      const { connection, error } = await kernel.twitter.getConnection(connectionId);
      if (error || !connection) {
        res.send('No connection found for session');
        return;
      }

      if (req.session && connection.confirmationCode === null) {
        req.session.destroy(() => {
          return;
        });
        res.send("Already succeded :) (btw I've destroyed your session)");
        return;
      }

      res.send(`Please send the following to the telegram bot: /confirm ${connection.confirmationCode}`);
    });

    TwitterRouter.get('/failure', (_, res) => {
      res.send('Already authorized. The owner needs to unlink first via /unlink twitter');
    });

    this._router = TwitterRouter;
  }

  get router(): Router {
    return this._router;
  }
}
