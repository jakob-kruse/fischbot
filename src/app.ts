import { FischHTTP } from './http';
import { FischTelegram } from './telegram';

export const fischTelegram = new FischTelegram();
export const fischHttp = new FischHTTP();

fischHttp.listen();
