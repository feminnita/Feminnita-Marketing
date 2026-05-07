import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getValidGA4Token, runGA4Report, getGA4Realtime } from "../services/ga4";
import { getDb } from "../db";
import { oauthTokens } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

async function getPropertyId(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({ accountInfo: oauthTokens.accountInfo })
    .from(oauthTokens)
    .where(and(
      eq(oauthTokens.userId, userId),
      eq(oauthTokens.plataforma, "google_analytics"),
      eq(oauthTokens.isActive, true),
    ))
    .limit(1);
  if (rows.length === 0) return null;
  const info = rows[0].accountInfo ? JSON.parse(rows[0].accountInfo) : {};
  return info.propertyId ?? null;
}

export const ga4Router = router({
  status: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { connected: false, propertyId: null };
    const rows = await db.select({ isActive: oauthTokens.isActive, accountInfo: oauthTokens.accountInfo })
      .from(oauthTokens)
      .where(and(eq(oauthTokens.userId, ctx.user.id), eq(oauthTokens.plataforma, "google_analytics")))
      .limit(1);
    if (rows.length === 0) return { connected: false, propertyId: null };
    const info = rows[0].accountInfo ? JSON.parse(rows[0].accountInfo) : {};
    return { connected: Boolean(rows[0].isActive), propertyId: (info.propertyId as string) ?? null };
  }),

  setPropertyId: protectedProcedure
    .input(z.object({ propertyId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");
      const rows = await db.select({ id: oauthTokens.id, accountInfo: oauthTokens.accountInfo })
        .from(oauthTokens)
        .where(and(eq(oauthTokens.userId, ctx.user.id), eq(oauthTokens.plataforma, "google_analytics")))
        .limit(1);
      if (rows.length === 0) throw new Error("GA4 não conectado");
      const info = rows[0].accountInfo ? JSON.parse(rows[0].accountInfo) : {};
      info.propertyId = input.propertyId;
      await db.update(oauthTokens).set({ accountInfo: JSON.stringify(info) })
        .where(eq(oauthTokens.id, rows[0].id));
      return { success: true };
    }),

  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB indisponível");
    await db.update(oauthTokens).set({ isActive: false })
      .where(and(eq(oauthTokens.userId, ctx.user.id), eq(oauthTokens.plataforma, "google_analytics")));
    return { success: true };
  }),

  overview: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const propertyId = await getPropertyId(ctx.user.id);
      if (!propertyId) throw new Error("Property ID não configurado");
      const token = await getValidGA4Token(ctx.user.id);
      if (!token) throw new Error("Token inválido — reconecte o GA4");

      const report = await runGA4Report(token, propertyId, {
        dateRanges: [{ startDate: `${input.days}daysAgo`, endDate: "today" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      }) as { rows?: Array<{ metricValues: Array<{ value: string }> }> };

      const vals = report.rows?.[0]?.metricValues ?? [];
      return {
        sessions: parseInt(vals[0]?.value ?? "0"),
        users: parseInt(vals[1]?.value ?? "0"),
        pageViews: parseInt(vals[2]?.value ?? "0"),
        bounceRate: parseFloat((parseFloat(vals[3]?.value ?? "0") * 100).toFixed(1)),
        avgSessionDuration: parseFloat(parseFloat(vals[4]?.value ?? "0").toFixed(0)),
      };
    }),

  trafficSources: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const propertyId = await getPropertyId(ctx.user.id);
      if (!propertyId) throw new Error("Property ID não configurado");
      const token = await getValidGA4Token(ctx.user.id);
      if (!token) throw new Error("Token inválido — reconecte o GA4");

      const report = await runGA4Report(token, propertyId, {
        dateRanges: [{ startDate: `${input.days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }) as { rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> };

      return (report.rows ?? []).map(r => ({
        channel: r.dimensionValues?.[0]?.value ?? "Unknown",
        sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
        users: parseInt(r.metricValues?.[1]?.value ?? "0"),
      }));
    }),

  topPages: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const propertyId = await getPropertyId(ctx.user.id);
      if (!propertyId) throw new Error("Property ID não configurado");
      const token = await getValidGA4Token(ctx.user.id);
      if (!token) throw new Error("Token inválido — reconecte o GA4");

      const report = await runGA4Report(token, propertyId, {
        dateRanges: [{ startDate: `${input.days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }) as { rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> };

      return (report.rows ?? []).map(r => ({
        path: r.dimensionValues?.[0]?.value ?? "/",
        views: parseInt(r.metricValues?.[0]?.value ?? "0"),
        users: parseInt(r.metricValues?.[1]?.value ?? "0"),
      }));
    }),

  realtime: protectedProcedure.query(async ({ ctx }) => {
    const propertyId = await getPropertyId(ctx.user.id);
    if (!propertyId) return { activeUsers: 0 };
    const token = await getValidGA4Token(ctx.user.id);
    if (!token) return { activeUsers: 0 };
    const activeUsers = await getGA4Realtime(token, propertyId);
    return { activeUsers };
  }),

  conversions: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const propertyId = await getPropertyId(ctx.user.id);
      if (!propertyId) throw new Error("Property ID não configurado");
      const token = await getValidGA4Token(ctx.user.id);
      if (!token) throw new Error("Token inválido — reconecte o GA4");

      const report = await runGA4Report(token, propertyId, {
        dateRanges: [{ startDate: `${input.days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [
          { name: "conversions" },
          { name: "eventCount" },
          { name: "eventValue" },
          { name: "totalUsers" },
        ],
        orderBys: [{ metric: { metricName: "conversions" }, desc: true }],
        limit: 20,
      }) as { rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> };

      return (report.rows ?? []).map(r => ({
        event: r.dimensionValues?.[0]?.value ?? "",
        conversions: parseInt(r.metricValues?.[0]?.value ?? "0"),
        eventCount: parseInt(r.metricValues?.[1]?.value ?? "0"),
        eventValue: parseFloat(parseFloat(r.metricValues?.[2]?.value ?? "0").toFixed(2)),
        users: parseInt(r.metricValues?.[3]?.value ?? "0"),
      }));
    }),

  utmCampaigns: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const propertyId = await getPropertyId(ctx.user.id);
      if (!propertyId) throw new Error("Property ID não configurado");
      const token = await getValidGA4Token(ctx.user.id);
      if (!token) throw new Error("Token inválido — reconecte o GA4");

      const report = await runGA4Report(token, propertyId, {
        dateRanges: [{ startDate: `${input.days}daysAgo`, endDate: "today" }],
        dimensions: [
          { name: "sessionSource" },
          { name: "sessionMedium" },
          { name: "sessionCampaignName" },
        ],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
          { name: "conversions" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 25,
      }) as { rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> };

      return (report.rows ?? []).map(r => ({
        source: r.dimensionValues?.[0]?.value ?? "(direct)",
        medium: r.dimensionValues?.[1]?.value ?? "(none)",
        campaign: r.dimensionValues?.[2]?.value ?? "(not set)",
        sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
        users: parseInt(r.metricValues?.[1]?.value ?? "0"),
        newUsers: parseInt(r.metricValues?.[2]?.value ?? "0"),
        bounceRate: parseFloat((parseFloat(r.metricValues?.[3]?.value ?? "0") * 100).toFixed(1)),
        avgDuration: parseFloat(parseFloat(r.metricValues?.[4]?.value ?? "0").toFixed(0)),
        conversions: parseInt(r.metricValues?.[5]?.value ?? "0"),
      }));
    }),

  devices: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const propertyId = await getPropertyId(ctx.user.id);
      if (!propertyId) throw new Error("Property ID não configurado");
      const token = await getValidGA4Token(ctx.user.id);
      if (!token) throw new Error("Token inválido — reconecte o GA4");

      const report = await runGA4Report(token, propertyId, {
        dateRanges: [{ startDate: `${input.days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "bounceRate" },
          { name: "screenPageViews" },
          { name: "conversions" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      }) as { rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> };

      return (report.rows ?? []).map(r => ({
        device: r.dimensionValues?.[0]?.value ?? "",
        sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
        users: parseInt(r.metricValues?.[1]?.value ?? "0"),
        bounceRate: parseFloat((parseFloat(r.metricValues?.[2]?.value ?? "0") * 100).toFixed(1)),
        pageViews: parseInt(r.metricValues?.[3]?.value ?? "0"),
        conversions: parseInt(r.metricValues?.[4]?.value ?? "0"),
      }));
    }),

  geo: protectedProcedure
    .input(z.object({ days: z.number().min(1).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const propertyId = await getPropertyId(ctx.user.id);
      if (!propertyId) throw new Error("Property ID não configurado");
      const token = await getValidGA4Token(ctx.user.id);
      if (!token) throw new Error("Token inválido — reconecte o GA4");

      const report = await runGA4Report(token, propertyId, {
        dateRanges: [{ startDate: `${input.days}daysAgo`, endDate: "today" }],
        dimensions: [{ name: "country" }, { name: "city" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "conversions" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 20,
      }) as { rows?: Array<{ dimensionValues: Array<{ value: string }>; metricValues: Array<{ value: string }> }> };

      return (report.rows ?? []).map(r => ({
        country: r.dimensionValues?.[0]?.value ?? "",
        city: r.dimensionValues?.[1]?.value ?? "",
        sessions: parseInt(r.metricValues?.[0]?.value ?? "0"),
        users: parseInt(r.metricValues?.[1]?.value ?? "0"),
        conversions: parseInt(r.metricValues?.[2]?.value ?? "0"),
      }));
    }),
});
