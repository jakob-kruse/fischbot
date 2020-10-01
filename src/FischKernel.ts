import TwitterConnection from '@model/twitterConnection';
import User from '@model/user';
import TwitterService from '@service/twitterService';
import UserService from '@service/userService';
import { envInt, envString, isDev } from '@util/env';
import { Connection as DatabaseService, createConnection } from 'typeorm';

export class FischKernel {
  private _databaseService!: DatabaseService;
  private _twitterService!: TwitterService;
  private _userService!: UserService;

  async start(): Promise<void> {
    this._databaseService = await createConnection({
      type: 'mariadb',
      host: envString('DB__HOST').value,
      port: envInt('DB__PORT').value,
      username: envString('DB__USER').value,
      password: envString('DB__PASSWORD').value,
      database: envString('DB__NAME').value,
      entities: [User, TwitterConnection],
      synchronize: true,
      logging: isDev(),
    });

    const twitterService = new TwitterService(this._databaseService.getRepository(TwitterConnection));
    if (!twitterService) {
      throw new Error('Twitter Service could not be initialized');
    }
    this._twitterService = twitterService;

    const userService = new UserService(this._databaseService.getRepository(User));
    if (!userService) {
      throw new Error('User Service could not be initialized');
    }
    this._userService = userService;
  }

  get twitter(): TwitterService {
    return this._twitterService;
  }

  get users(): UserService {
    return this._userService;
  }

  get database(): DatabaseService {
    return this._databaseService;
  }
}
