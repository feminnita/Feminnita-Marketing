/**
 * Seed file para criar as 5 contas Instagram
 * Execute com: node -r tsx server/seeds/instagram-accounts.seed.ts
 */

import { getDb } from "../db";
import { instagramAccounts } from "../../drizzle/schema";

const INSTAGRAM_ACCOUNTS = [
  {
    accountType: "feminnita" as const,
    influencerId: null,
    instagramId: "123456789",
    username: "feminnita",
    displayName: "Feminnita Pijamas",
    profilePictureUrl: "https://instagram.com/feminnita/profile.jpg",
    biography: "Atacado de Pijamas de Qualidade | Moda Confortável",
  },
  {
    accountType: "influencer" as const,
    influencerId: 1,
    instagramId: "987654321",
    username: "carol_influencer.2026",
    displayName: "Carol Influencer",
    profilePictureUrl: "https://instagram.com/carol_influencer.2026/profile.jpg",
    biography: "Influenciadora de Moda | Feminnita",
  },
  {
    accountType: "influencer" as const,
    influencerId: 2,
    instagramId: "987654322",
    username: "renata_influencer.2026",
    displayName: "Renata Influencer",
    profilePictureUrl: "https://instagram.com/renata_influencer.2026/profile.jpg",
    biography: "Influenciadora de Moda | Feminnita",
  },
  {
    accountType: "influencer" as const,
    influencerId: 3,
    instagramId: "987654323",
    username: "vanessa_influencer.2026",
    displayName: "Vanessa Influencer",
    profilePictureUrl: "https://instagram.com/vanessa_influencer.2026/profile.jpg",
    biography: "Influenciadora de Moda | Feminnita",
  },
  {
    accountType: "influencer" as const,
    influencerId: 4,
    instagramId: "987654324",
    username: "luiza_influencer.2026",
    displayName: "Luiza Influencer",
    profilePictureUrl: "https://instagram.com/luiza_influencer.2026/profile.jpg",
    biography: "Influenciadora de Moda | Feminnita",
  },
];

async function seedInstagramAccounts() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database connection failed");
      process.exit(1);
    }

    console.log("🌱 Seeding Instagram accounts...");

    for (const account of INSTAGRAM_ACCOUNTS) {
      await db.insert(instagramAccounts).values({
        ...account,
        accessToken: "PLACEHOLDER_TOKEN",
        refreshToken: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Created account: @${account.username}`);
    }

    console.log("✅ All Instagram accounts seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Instagram accounts:", error);
    process.exit(1);
  }
}

seedInstagramAccounts();
