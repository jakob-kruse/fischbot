import cryptoRandomString from 'crypto-random-string';
import { Repository } from 'typeorm';
import { kernel, http } from '@kernel';
import TwitterConnection from '@model/twitterConnection';

export default class TwitterService {
  constructor(private twitterConnRepo: Repository<TwitterConnection>) {}

  get connectionURL(): string {
    return `${http.address}/twitter/start`;
  }

  async createEmptyConnection(
    accessToken: string,
    accessTokenSecret: string,
  ): Promise<{
    connection: TwitterConnection | null;
    error: string | null;
  }> {
    const duplicate: TwitterConnection | undefined = await this.twitterConnRepo
      .createQueryBuilder('conn')
      .where('conn.accessToken = :accessToken', { accessToken })
      .andWhere('conn.accessTokenSecret = :accessTokenSecret', { accessTokenSecret })
      .getOne();

    if (!duplicate) {
      return {
        connection: null,
        error: 'Already authorized. The owner needs to unlink first via /unlink twitter',
      };
    }

    const emptyConnection = new TwitterConnection();
    emptyConnection.accessToken = accessToken;
    emptyConnection.accessTokenSecret = accessTokenSecret;
    emptyConnection.confirmationCode = cryptoRandomString({
      length: 10,
    });

    const newConnection = await this.twitterConnRepo.save(emptyConnection);

    return {
      connection: newConnection,
      error: null,
    };
  }

  async getConnection(
    id: number,
  ): Promise<{
    connection: TwitterConnection | null;
    error: string | null;
  }> {
    const connection = await this.twitterConnRepo.findOne(id);
    if (!connection) {
      return {
        connection: null,
        error: 'Connection not found',
      };
    }

    return {
      connection,
      error: null,
    };
  }

  async removeAllStale(): Promise<void> {
    await this.twitterConnRepo.createQueryBuilder().delete().where('TwitterConnection.created >= 10');
  }

  async confirmUserByCode(
    telegramId: number,
    code: string,
  ): Promise<{
    connection: TwitterConnection | null;
    error: string | null;
  }> {
    const connection = await this.twitterConnRepo.findOne({
      where: { confirmationCode: code },
    });
    if (!connection) {
      return {
        connection: null,
        error: 'Connection not found',
      };
    }

    const { user, error } = await kernel.users.createWithTwitter(telegramId, connection);
    if (error || !user) {
      return { connection: null, error };
    }

    connection.owner = user;
    connection.confirmationCode = null;

    await this.twitterConnRepo.save(connection);

    return {
      connection,
      error: null,
    };
  }

  async deleteConnection(connection: TwitterConnection): Promise<void> {
    await this.twitterConnRepo.remove(connection);
  }
}
