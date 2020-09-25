type EnvNamesString = 'DB__NAME' | 'DB__USER' | 'DB__PASSWORD' | 'DB__ROOT_PASSWORD' | 'APP__TELEGRAM_TOKEN';
type EnvNamesInteger = 'APP__PORT';

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

export function ensureEnvString(
  envName: EnvNamesString,
  errorText: (envName: string, envContent: string | undefined) => string = defaultErrorTextString,
  validator: (value: string | undefined) => string | null = defaultValidatorString,
): {
  value: string | null;
  error: string | null;
} {
  const envContent = process.env[envName];

  const valueString = validator(envContent);

  if (valueString === null) {
    return {
      value: null,
      error: errorText(envName, envContent),
    };
  }

  return {
    value: valueString,
    error: null,
  };
}

export function ensureEnvInt(
  envName: EnvNamesInteger,
  errorText: (envName: string, envContent: string | undefined) => string = defaultErrorTextInteger,
  validator: (value: string | undefined) => number | null = defaultValidatorInteger,
): {
  value: number | null;
  error: string | null;
} {
  const envContent = process.env[envName];

  const valueInt = validator(envContent);

  if (valueInt === null) {
    return {
      value: null,
      error: errorText(envName, envContent),
    };
  }

  return {
    value: valueInt,
    error: null,
  };
}
