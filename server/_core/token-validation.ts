import { getOAuthToken, updateOAuthTokenLastUsed } from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Token Validation Middleware
 * Validates OAuth tokens before making API calls
 */

export type Platform = "bling" | "meta" | "tiktok" | "google_drive";

export interface TokenValidationResult {
  valid: boolean;
  token?: string;
  error?: string;
  isExpired?: boolean;
}

/**
 * Validates if a token exists and is not expired
 */
export async function validateToken(
  userId: number,
  platform: Platform
): Promise<TokenValidationResult> {
  try {
    const tokenRecord = await getOAuthToken(userId, platform);

    if (!tokenRecord) {
      return {
        valid: false,
        error: `${platform} não está conectado`,
      };
    }

    const now = new Date();
    const isExpired = tokenRecord.expiresAt && new Date(tokenRecord.expiresAt) < now;

    if (isExpired) {
      return {
        valid: false,
        isExpired: true,
        error: `Token do ${platform} expirou. Por favor, reconecte.`,
      };
    }

    // Update last used timestamp
    await updateOAuthTokenLastUsed(userId, platform);

    return {
      valid: true,
      token: tokenRecord.accessToken,
    };
  } catch (error) {
    return {
      valid: false,
      error: `Erro ao validar token: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Middleware for tRPC procedures that require OAuth token validation
 */
export function createTokenValidationMiddleware(platform: Platform) {
  return async (opts: any) => {
    const userId = opts.ctx.user?.id;

    if (!userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Usuário não autenticado",
      });
    }

    const validation = await validateToken(userId, platform);

    if (!validation.valid) {
      if (validation.isExpired) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: validation.error || `Token do ${platform} expirou`,
        });
      }

      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: validation.error || `${platform} não está conectado`,
      });
    }

    // Add token to context for use in the procedure
    return opts.next({
      ctx: {
        ...opts.ctx,
        oauthToken: validation.token,
        platform,
      },
    });
  };
}

/**
 * Helper to check multiple tokens
 */
export async function validateMultipleTokens(
  userId: number,
  platforms: Platform[]
): Promise<Record<Platform, TokenValidationResult>> {
  const results: Record<Platform, TokenValidationResult> = {} as any;

  for (const platform of platforms) {
    results[platform] = await validateToken(userId, platform);
  }

  return results;
}

/**
 * Get all connected platforms for a user
 */
export async function getConnectedPlatforms(userId: number): Promise<Platform[]> {
  const platforms: Platform[] = ["bling", "meta", "tiktok", "google_drive"];
  const connected: Platform[] = [];

  for (const platform of platforms) {
    const validation = await validateToken(userId, platform);
    if (validation.valid) {
      connected.push(platform);
    }
  }

  return connected;
}

/**
 * Check if a token will expire soon (within 24 hours)
 */
export async function checkTokenExpiringSoon(
  userId: number,
  platform: Platform,
  hoursThreshold: number = 24
): Promise<boolean> {
  try {
    const tokenRecord = await getOAuthToken(userId, platform);

    if (!tokenRecord || !tokenRecord.expiresAt) {
      return false;
    }

    const now = new Date();
    const expiresAt = new Date(tokenRecord.expiresAt);
    const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

    return hoursUntilExpiry < hoursThreshold && hoursUntilExpiry > 0;
  } catch (error) {
    console.error("Error checking token expiry:", error);
    return false;
  }
}

/**
 * Get token expiry info
 */
export async function getTokenExpiryInfo(
  userId: number,
  platform: Platform
): Promise<{
  expiresAt?: Date;
  expiresIn?: number; // milliseconds
  isExpired: boolean;
  expiringsSoon: boolean;
}> {
  try {
    const tokenRecord = await getOAuthToken(userId, platform);

    if (!tokenRecord || !tokenRecord.expiresAt) {
      return {
        isExpired: false,
        expiringsSoon: false,
      };
    }

    const now = new Date();
    const expiresAt = new Date(tokenRecord.expiresAt);
    const expiresIn = expiresAt.getTime() - now.getTime();
    const isExpired = expiresIn < 0;
    const expiringsSoon = expiresIn < 24 * 60 * 60 * 1000 && expiresIn > 0; // 24 hours

    return {
      expiresAt,
      expiresIn: Math.max(0, expiresIn),
      isExpired,
      expiringsSoon,
    };
  } catch (error) {
    console.error("Error getting token expiry info:", error);
    return {
      isExpired: false,
      expiringsSoon: false,
    };
  }
}
