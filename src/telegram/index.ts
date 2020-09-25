// import Telegraf from 'telegraf';
// import { TelegrafContext } from 'telegraf/typings/context';
import { ensureEnvString } from '../util/ensureEnv';

export class FischTelegram {
  //   private telegraf: Telegraf<TelegrafContext>;

  constructor() {
    const { error, value } = ensureEnvString('APP__TELEGRAM_TOKEN');
    if (error) {
      throw new Error(error);
    }

    if (!value) {
      throw new Error(`Invalid Telegram Bot Token: "${value}"`);
    }

    // this.telegraf = new Telegraf(value);
  }
}
