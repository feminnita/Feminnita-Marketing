import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User, PortalUser } from "../../drizzle/schema";
import { sdk, portalSdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  portalUser: PortalUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let portalUser: PortalUser | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch {
    user = null;
  }

  try {
    portalUser = await portalSdk.authenticatePortalRequest(opts.req);
  } catch {
    portalUser = null;
  }

  return { req: opts.req, res: opts.res, user, portalUser };
}
