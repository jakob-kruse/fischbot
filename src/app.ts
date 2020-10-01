import 'reflect-metadata';
import { FischHTTP } from './core/http';
import { FischTelegram } from './core/telegram';
import { FischKernel } from './FischKernel';
import { cLog as fischLog } from '@util/logger';

export const kernel = new FischKernel();

export const telegram = new FischTelegram();
export const http = new FischHTTP();

async function boot(): Promise<void> {
  await kernel.start();
  fischLog({ message: `Database Service started` });
  await telegram.start();
  fischLog({ message: `Telegraf started` });
  await http.start();
  fischLog({ message: `HTTP Server started` });
}

boot();
