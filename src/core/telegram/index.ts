import Telegraf, { Extra, Markup } from 'telegraf';
import { TelegrafContext } from 'telegraf/typings/context';
import { envString } from '@util/env';
import { kernel } from '@kernel';

export class FischTelegram {
  private telegraf: Telegraf<TelegrafContext>;

  constructor() {
    const { value: telegramToken } = envString('APP__TELEGRAM_TOKEN');

    this.telegraf = new Telegraf(telegramToken);
  }

  private validateCommand(
    ctx: TelegrafContext,
    commandName: string,
    argsLength: number,
    usage: string,
  ): {
    command: {
      name: string;
      value: string[] | null;
      valueString: string | null;
    } | null;
    error: string | null;
  } {
    const text = ctx.message?.text?.trim();
    const args = text?.split(' ') ?? text;

    const userId = ctx.from?.id;
    if (!userId) {
      return {
        command: null,
        error: 'Could not determine your UserID',
      };
    }

    if (!text || !text.startsWith(`/${commandName}`) || args?.length !== argsLength) {
      return {
        command: null,
        error: `Invalid command format. Usage: /${commandName} ${usage}`,
      };
    }

    if (typeof args === 'string') {
      return {
        command: {
          name: args.trim(),
          value: [],
          valueString: '',
        },
        error: null,
      };
    }

    return {
      command: {
        name: args[0],
        value: args.slice(1),
        valueString: args.slice(1).join(''),
      },
      error: null,
    };
  }

  start(): void {
    this.telegraf.command('/link', this.linkCommand.bind(this));

    this.telegraf.command('/unlink', this.unlinkCommand.bind(this));

    this.telegraf.command('/confirm', this.confirmCommand.bind(this));

    this.telegraf.launch();
  }

  async linkCommand(ctx: TelegrafContext): Promise<void> {
    const { command, error } = this.validateCommand(ctx, 'link', 2, '<connection>');

    if (!command || error) {
      if (error) {
        ctx.reply(error);
      }
      return;
    }

    if (command.value?.length === 0) {
      this.connectMenu(ctx);
      return;
    }

    switch (command.valueString) {
      case 'twitter':
        ctx.reply(kernel.twitter.connectionURL);
        break;
    }
    return;
  }

  async unlinkCommand(
    ctx: TelegrafContext,
  ): Promise<{
    error: null | string;
  }> {
    const { command, error } = this.validateCommand(ctx, 'unlink', 2, '<connection>');

    if (!command || error) {
      ctx.reply(error ?? 'No error provided');
      return { error };
    }

    if (command.valueString === 'twitter') {
      const { error } = await kernel.users.unlinkTwitter(ctx?.from?.id ?? -1);

      if (error) {
        ctx.reply(error);
        return { error: error };
      } else {
        ctx.reply('Unlinked');
        return { error: null };
      }
    }
    return { error: 'Already confirmed or no connection started via /link twitter!' };
  }

  async confirmCommand(ctx: TelegrafContext): Promise<{ error: string | null }> {
    const { command, error: commandError } = this.validateCommand(ctx, 'confirm', 2, '<code>');
    if (!command || commandError) {
      return { error: commandError };
    }
    if (!ctx.from?.id) {
      const error = 'User not found';
      ctx.reply(error);
      return { error };
    }

    const { error } = await kernel.twitter.confirmUserByCode(ctx.from.id, command.valueString ?? '');
    if (error) {
      ctx.reply(error);
      return { error };
    }

    ctx.reply('Success!');
    return { error: null };
  }

  connectMenu(ctx: TelegrafContext): void {
    const connectKeyboard = Markup.inlineKeyboard([Markup.urlButton('Twitter', kernel.twitter.connectionURL)]);
    ctx.reply('Choose Provider...', Extra.markup(connectKeyboard)).catch(() => {
      ctx.reply(`Something went wrong! Please visit: ${kernel.twitter.connectionURL}`);
    });
  }
}
