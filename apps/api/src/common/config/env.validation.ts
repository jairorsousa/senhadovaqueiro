type Environment = Record<string, string | undefined>;

const requiredVariables = ["DATABASE_URL", "REDIS_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

function required(name: string, value: string | undefined) {
  if (!value || value.trim().length === 0) {
    throw new Error(`Variavel de ambiente obrigatoria ausente: ${name}`);
  }
}

function optionalPort(name: string, value: string | undefined) {
  if (value === undefined) {
    return;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Variavel ${name} deve ser uma porta valida.`);
  }
}

export function validateEnvironment(config: Environment) {
  for (const name of requiredVariables) {
    required(name, config[name]);
  }

  optionalPort("API_PORT", config.API_PORT);

  return {
    ...config,
    API_PORT: config.API_PORT === undefined ? 3333 : Number(config.API_PORT)
  };
}
