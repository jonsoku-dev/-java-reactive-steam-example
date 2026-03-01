import { mysqlTable, serial, varchar, json, timestamp } from 'drizzle-orm/mysql-core';

export const analysisResults = mysqlTable('analysis_results', {
  id: serial('id').primaryKey(),
  marketData: varchar('market_data', { length: 1024 }),
  macroRegime: json('macro_regime'),
  portfolio: json('portfolio'),
  redTeam: json('red_team'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type AnalysisResult = typeof analysisResults.$inferSelect;
export type NewAnalysisResult = typeof analysisResults.$inferInsert;
