type EnvNamesString =
  | 'DB__HOST'
  | 'DB__NAME'
  | 'DB__USER'
  | 'DB__PASSWORD'
  | 'DB__ROOT_PASSWORD'
  | 'APP__TELEGRAM_TOKEN'
  | 'APP__PROTOCOL'
  | 'APP__HOST'
  | 'APP__TWITTER_CONSUMER_TOKEN'
  | 'APP__TWITTER_CONSUMER_TOKEN_SECRET'
  | 'APP__TWITTER_CALLBACK_URL'
  | 'REDIS__SECRET'
  | 'REDIS__HOST';
type EnvNamesInteger = 'APP__PORT' | 'REDIS__PORT' | 'DB__PORT';

function defaultValidatorString(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  return value;
}

function defaultValidatorInteger(value: string | undefined): number | null {
  const valueInt = parseInt(value ?? '');

  if (isNaN(valueInt)) {
    return null;
  }

  return valueInt;
}

function defaultErrorTextString(envName: string, envContent: string | undefined): string {
  return `Please define "${envName}" (Currently: "${envContent}") in the .env file of the project root or run bin/docker:init.sh`;
}

function defaultErrorTextInteger(envName: string, envContent: string | undefined): string {
  return `Please define "${envName}" as a valid *number* (Currently: "${envContent}" with type: "${typeof envContent}") in the .env file of the project root or run bin/docker:init.sh`;
}

export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function envString(
  envName: EnvNamesString,
  options?: {
    validator?: ((value: string | undefined) => string | null) | undefined;
    errorText?: ((envName: string, envContent: string | undefined) => string) | undefined;
    throw?: boolean;
  },
): {
  value: string;
  error: string | null;
} {
  const envContent = process.env[envName];

  const valueString = options?.validator ? options.validator(envContent) : defaultValidatorString(envContent);

  if (valueString === null) {
    const error = options?.errorText
      ? options.errorText(envName, envContent)
      : defaultErrorTextString(envName, envContent);
    if (options?.throw === undefined || options.throw === true) {
      throw new Error(error);
    }
    return {
      value: '',
      error,
    };
  }

  return {
    value: valueString,
    error: null,
  };
}

export function envInt(
  envName: EnvNamesInteger,
  options?: {
    validator?: ((value: string | undefined) => number | null) | undefined;
    errorText?: ((envName: string, envContent: string | undefined) => string) | undefined;
    throw?: boolean;
  },
): {
  value: number;
  error: string | null;
} {
  const envContent = process.env[envName];

  const valueInt = options?.validator ? options.validator(envContent) : defaultValidatorInteger(envContent);

  if (valueInt === null) {
    const error = options?.errorText
      ? options.errorText(envName, envContent)
      : defaultErrorTextInteger(envName, envContent);
    if (options?.throw === undefined || options.throw === true) {
      throw new Error(error);
    }
    return {
      value: -1,
      error,
    };
  }

  return {
    value: valueInt,
    error: null,
  };
}
