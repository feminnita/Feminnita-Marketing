export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // LLM / AI service (supports both new LLM_API_* and legacy BUILT_IN_FORGE_* names)
  forgeApiUrl: process.env.LLM_API_URL ?? process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.LLM_API_KEY ?? process.env.BUILT_IN_FORGE_API_KEY ?? "",
  metaAccessToken: process.env.META_ACCESS_TOKEN ?? "",
  metaAdAccountId: (process.env.META_AD_ACCOUNT_ID ?? "").startsWith("act_")
    ? (process.env.META_AD_ACCOUNT_ID ?? "")
    : process.env.META_AD_ACCOUNT_ID
    ? `act_${process.env.META_AD_ACCOUNT_ID}`
    : "",
  metaPixelId: process.env.META_PIXEL_ID ?? "",
};
