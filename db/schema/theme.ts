import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const siteThemes = pgTable('site_themes', {
  id: uuid('id').defaultRandom().primaryKey(),
  themeKey: text('theme_key').default('default').notNull().unique(),
  presetName: text('preset_name').default('classic').notNull(),
  primaryColor: text('primary_color').default('#6E101E').notNull(),
  primaryHoverColor: text('primary_hover_color').default('#560D19').notNull(),
  buttonTextColor: text('button_text_color').default('#FFFFFF').notNull(),
  bgColor: text('bg_color').default('#FBF7F6').notNull(),
  surfaceColor: text('surface_color').default('#FFFFFF').notNull(),
  accentColor: text('accent_color').default('#A81B2D').notNull(),

  // Gradient Controls
  heroGradientEnabled: boolean('hero_gradient_enabled').default(false).notNull(),
  heroGradientStart: text('hero_gradient_start').default('#560D19').notNull(),
  heroGradientEnd: text('hero_gradient_end').default('#8A1426').notNull(),
  heroGradientAngle: integer('hero_gradient_angle').default(135).notNull(),

  buttonGradientEnabled: boolean('button_gradient_enabled').default(false).notNull(),
  buttonGradientStart: text('button_gradient_start').default('#6E101E').notNull(),
  buttonGradientEnd: text('button_gradient_end').default('#A81B2D').notNull(),
  buttonGradientAngle: integer('button_gradient_angle').default(90).notNull(),

  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
