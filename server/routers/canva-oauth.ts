import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { oauthCredentials } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// Helper function to generate PKCE code_challenge
function generateCodeChallenge(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  return { codeVerifier, codeChallenge };
}

export const canvaOAuthRouter = router({
  // Get authorization URL
  getAuthorizationUrl: protectedProcedure.query(({ ctx }) => {
    const { codeVerifier, codeChallenge } = generateCodeChallenge();
    
    // Store code_verifier in session (you might want to use Redis or database for this)
    // For now, we'll return both and let the client store the verifier
    
    const clientId = "OC-AZwe5Lb9Mj6o";
    const redirectUri = process.env.CANVA_REDIRECT_URI || "https://marketing.feminnita.com.br/api/canva/callback";
    
    const authUrl = new URL("https://www.canva.com/api/oauth/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("code_challenge", codeChallenge);
    authUrl.searchParams.append("code_challenge_method", "s256");
    
    return {
      authUrl: authUrl.toString(),
      codeVerifier, // Return this to the client to store temporarily
    };
  }),

  // Handle OAuth callback
  handleCallback: publicProcedure
    .input(
      z.object({
        code: z.string(),
        codeVerifier: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const clientId = process.env.CANVA_CLIENT_ID || "";
        const clientSecret = process.env.CANVA_CLIENT_SECRET || "";
        const redirectUri = process.env.CANVA_REDIRECT_URI || "https://feminnita-5s7usnyn.manus.space/api/canva/callback";

        // Exchange authorization code for access token
        const tokenResponse = await fetch("https://api.canva.com/rest/v1/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            grant_type: "authorization_code",
            code: input.code,
            client_id: clientId,
            client_secret: clientSecret,
            code_verifier: input.codeVerifier,
            redirect_uri: redirectUri,
          }),
        });

        if (!tokenResponse.ok) {
          const error = await tokenResponse.json();
          throw new Error(`Erro ao obter token: ${error.error_description || error.error}`);
        }

        const tokenData = await tokenResponse.json();

        // Save to database
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Delete existing Canva credential
        await db
          .delete(oauthCredentials)
          .where(
            and(
              eq(oauthCredentials.userId, parseInt(input.userId)),
              eq(oauthCredentials.platform, "canva")
            )
          );

        // Save new credential
        await db.insert(oauthCredentials).values({
          userId: parseInt(input.userId),
          platform: "canva",
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || null,
          expiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
          lastValidated: new Date(),
        });

        return {
          success: true,
          message: "Canva conectado com sucesso!",
          accessToken: tokenData.access_token,
        };
      } catch (error: any) {
        throw new Error(`Erro ao conectar Canva: ${error.message}`);
      }
    }),

  // Refresh access token
  refreshToken: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const credential = await db
      .select()
      .from(oauthCredentials)
      .where(
        and(
          eq(oauthCredentials.userId, ctx.user.id),
          eq(oauthCredentials.platform, "canva")
        )
      )
      .limit(1);

    if (!credential.length || !credential[0].refreshToken) {
      throw new Error("Canva não conectado ou refresh token não disponível");
    }

    try {
      const clientId = process.env.CANVA_CLIENT_ID || "";
      const clientSecret = process.env.CANVA_CLIENT_SECRET || "";

      const tokenResponse = await fetch("https://api.canva.com/rest/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: credential[0].refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error("Erro ao renovar token do Canva");
      }

      const tokenData = await tokenResponse.json();

      // Update credential
      await db
        .update(oauthCredentials)
        .set({
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || credential[0].refreshToken,
          expiresAt: tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000)
            : null,
          lastValidated: new Date(),
        })
        .where(
          and(
            eq(oauthCredentials.userId, ctx.user.id),
            eq(oauthCredentials.platform, "canva")
          )
        );

      return { success: true, message: "Token renovado com sucesso" };
    } catch (error: any) {
      throw new Error(`Erro ao renovar token: ${error.message}`);
    }
  }),
});
