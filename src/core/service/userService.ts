import { kernel } from '@kernel';
import TwitterConnection from '@model/twitterConnection';
import User from '@model/user';
import { Repository } from 'typeorm';

export default class UserService {
  constructor(private userRepo: Repository<User>) {}

  async createWithTwitter(
    telegramId: number,
    twitterConnection: TwitterConnection,
  ): Promise<{
    user: User | null;
    error: string | null;
  }> {
    const { user, error } = await this.getUserByTelegramId(telegramId);

    if (user && !error) {
      user.twitterConnection = twitterConnection;
      return {
        user,
        error: null,
      };
    }

    const newUser = new User();
    newUser.telegramId = telegramId;
    newUser.twitterConnection = twitterConnection;

    return {
      user: await this.userRepo.save(newUser),
      error: null,
    };
  }

  async getUserByTelegramId(
    telegramId: number,
    relations = ['twitterConnection'],
  ): Promise<{
    user: User | null;
    error: string | null;
  }> {
    const user = await this.userRepo.findOne({
      where: {
        telegramId,
      },
      relations,
    });

    if (!user) {
      return {
        user: null,
        error: 'User not found',
      };
    }

    return {
      user,
      error: null,
    };
  }

  async unlinkTwitter(
    telegramId: number,
  ): Promise<{
    success: boolean | null;
    error: string | null;
  }> {
    const { user, error } = await this.getUserByTelegramId(telegramId);

    if (error || !user) {
      return { success: false, error };
    }

    if (!user.twitterConnection) {
      return { success: false, error: 'Already unlinked/ not linked' };
    }

    await kernel.twitter.deleteConnection(user.twitterConnection);

    await this.userRepo.save(user);

    return { success: true, error: null };
  }
}
