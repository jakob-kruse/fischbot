const isQuiet = process.argv.includes('--quiet');

type LogMessage = {
  time?: Date;
  message?: string;
};
export function cLog({ time, message }: LogMessage = {}): boolean {
  if (isQuiet) {
    return false;
  }

  time = time ?? new Date();

  message = message ?? '*no message provided*';

  console.log(`[${time.toLocaleDateString()}-${time.toLocaleTimeString()}] ${message}`);
  return true;
}
