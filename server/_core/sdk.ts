/**
 * Session service — signs and verifies JWT session cookies.
 * No external OAuth provider required.
 */

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User, PortalUser } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { ForbiddenError } from "@shared/_core/errors";

export const PORTAL_COOKIE_NAME = "portal_session";

export type SessionPayload = {
  userId: number;
  email: string;
};

class SessionService {
  private getSecret() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  private parseCookies(cookieHeader: string | undefined): Map<string, string> {
    if (!cookieHeader) return new Map();
    return new Map(Object.entries(parseCookieHeader(cookieHeader)));
  }

  async signSession(
    payload: SessionPayload,
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

    return new SignJWT({ userId: payload.userId, email: payload.email })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(this.getSecret());
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<SessionPayload | null> {
    if (!cookieValue) return null;
    try {
      const { payload } = await jwtVerify(cookieValue, this.getSecret(), {
        algorithms: ["HS256"],
      });
      const { userId, email } = payload as Record<string, unknown>;
      if (typeof userId !== "number" || typeof email !== "string") return null;
      return { userId, email };
    } catch {
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) throw ForbiddenError("Invalid session");

    const user = await db.getUserById(session.userId);
    if (!user) throw ForbiddenError("User not found");

    db.updateLastSignedIn(user.id).catch(() => {});
    return user;
  }
}

export const sdk = new SessionService();

class PortalSessionService {
  private getSecret() {
    return new TextEncoder().encode(ENV.cookieSecret + "_portal");
  }

  private parseCookies(cookieHeader: string | undefined): Map<string, string> {
    if (!cookieHeader) return new Map();
    return new Map(Object.entries(parseCookieHeader(cookieHeader)));
  }

  async signSession(
    payload: { userId: number; email: string },
    options: { expiresInMs?: number } = {}
  ): Promise<string> {
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);
    return new SignJWT({ userId: payload.userId, email: payload.email })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(this.getSecret());
  }

  async verifySession(cookieValue: string | undefined | null): Promise<{ userId: number; email: string } | null> {
    if (!cookieValue) return null;
    try {
      const { payload } = await jwtVerify(cookieValue, this.getSecret(), {
        algorithms: ["HS256"],
      });
      const { userId, email } = payload as Record<string, unknown>;
      if (typeof userId !== "number" || typeof email !== "string") return null;
      return { userId, email };
    } catch {
      return null;
    }
  }

  async authenticatePortalRequest(req: Request): Promise<PortalUser> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(PORTAL_COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);

    if (!session) throw ForbiddenError("Sessão do portal inválida");

    const user = await db.getPortalUserById(session.userId);
    if (!user) throw ForbiddenError("Usuária do portal não encontrada");
    if (user.status !== "approved") throw ForbiddenError("Acesso não aprovado");

    return user;
  }
}

export const portalSdk = new PortalSessionService();
