const formatMetaAccountId = (accountId: string): string => {
  if (!accountId) return "";
  // Se já tem o prefixo act_, retorna como está
  if (accountId.startsWith("act_")) return accountId;
  // Caso contrário, adiciona o prefixo
  return `act_${accountId}`;
};

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  metaAccessToken: process.env.META_ACCESS_TOKEN ?? "",
  metaAdAccountId: formatMetaAccountId(process.env.META_AD_ACCOUNT_ID ?? ""),
  metaPixelId: process.env.META_PIXEL_ID ?? "",
};
