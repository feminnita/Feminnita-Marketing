// Manus OAuth removed. Auth is handled via tRPC auth.login / auth.register.
// This file is kept as a placeholder to avoid breaking imports.
import type { Express } from "express";
export function registerOAuthRoutes(_app: Express) {}
