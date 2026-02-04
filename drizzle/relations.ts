import { relations } from "drizzle-orm";
import {
  users,
  influencers,
  influencerAccounts,
  contentItems,
  mediaFiles,
  scheduledPosts,
  postHistory,
  influencerPosts,
  influencerPerformance,
  influencerTrends,
  influencerInteractions,
  influencerKnowledgeBase,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  influencers: many(influencers),
  contentItems: many(contentItems),
  mediaFiles: many(mediaFiles),
  scheduledPosts: many(scheduledPosts),
  postHistory: many(postHistory),
}));

export const influencersRelations = relations(influencers, ({ one, many }) => ({
  user: one(users, {
    fields: [influencers.userId],
    references: [users.id],
  }),
  accounts: many(influencerAccounts),
  posts: many(influencerPosts),
  performance: many(influencerPerformance),
  trends: many(influencerTrends),
  interactions: many(influencerInteractions),
  knowledgeBase: many(influencerKnowledgeBase),
}));

export const influencerAccountsRelations = relations(
  influencerAccounts,
  ({ one }) => ({
    influencer: one(influencers, {
      fields: [influencerAccounts.influencerId],
      references: [influencers.id],
    }),
  })
);

export const contentItemsRelations = relations(contentItems, ({ one, many }) => ({
  user: one(users, {
    fields: [contentItems.userId],
    references: [users.id],
  }),
  mediaFiles: many(mediaFiles),
  scheduledPosts: many(scheduledPosts),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  contentItem: one(contentItems, {
    fields: [mediaFiles.contentId],
    references: [contentItems.id],
  }),
  user: one(users, {
    fields: [mediaFiles.userId],
    references: [users.id],
  }),
}));

export const scheduledPostsRelations = relations(
  scheduledPosts,
  ({ one, many }) => ({
    contentItem: one(contentItems, {
      fields: [scheduledPosts.contentId],
      references: [contentItems.id],
    }),
    user: one(users, {
      fields: [scheduledPosts.userId],
      references: [users.id],
    }),
    postHistory: many(postHistory),
  })
);

export const postHistoryRelations = relations(postHistory, ({ one }) => ({
  scheduledPost: one(scheduledPosts, {
    fields: [postHistory.scheduledPostId],
    references: [scheduledPosts.id],
  }),
  contentItem: one(contentItems, {
    fields: [postHistory.contentId],
    references: [contentItems.id],
  }),
  user: one(users, {
    fields: [postHistory.userId],
    references: [users.id],
  }),
}));

export const influencerPostsRelations = relations(influencerPosts, ({ one }) => ({
  influencer: one(influencers, {
    fields: [influencerPosts.influencerId],
    references: [influencers.id],
  }),
}));

export const influencerPerformanceRelations = relations(
  influencerPerformance,
  ({ one }) => ({
    influencer: one(influencers, {
      fields: [influencerPerformance.influencerId],
      references: [influencers.id],
    }),
  })
);

export const influencerTrendsRelations = relations(influencerTrends, ({ one }) => ({
  influencer: one(influencers, {
    fields: [influencerTrends.influencerId],
    references: [influencers.id],
  }),
}));

export const influencerInteractionsRelations = relations(
  influencerInteractions,
  ({ one }) => ({
    influencer: one(influencers, {
      fields: [influencerInteractions.influencerId],
      references: [influencers.id],
    }),
  })
);

export const influencerKnowledgeBaseRelations = relations(
  influencerKnowledgeBase,
  ({ one }) => ({
    influencer: one(influencers, {
      fields: [influencerKnowledgeBase.influencerId],
      references: [influencers.id],
    }),
  })
);
