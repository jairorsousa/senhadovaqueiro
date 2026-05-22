export const appName = "Senha do Vaqueiro";

export const requiredEnvironmentVariables = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "APP_URL",
  "API_URL"
] as const;

export type RequiredEnvironmentVariable = (typeof requiredEnvironmentVariables)[number];
