import { db } from '@/db';
import { siteThemes } from '@/db/schema/theme';
import { eq } from 'drizzle-orm';
import { SiteTheme } from '@/lib/types/database';
import { isMemoryBackendAllowed, getMemorySiteTheme, updateMemorySiteTheme, defaultSiteTheme } from '@/lib/db/store';

export async function getSiteTheme(): Promise<SiteTheme> {
  if (db) {
    try {
      const [existing] = await db
        .select()
        .from(siteThemes)
        .where(eq(siteThemes.themeKey, 'default'))
        .limit(1);

      if (existing) {
        return {
          id: existing.id,
          theme_key: existing.themeKey,
          preset_name: existing.presetName,
          primary_color: existing.primaryColor,
          primary_hover_color: existing.primaryHoverColor,
          button_text_color: existing.buttonTextColor,
          bg_color: existing.bgColor,
          surface_color: existing.surfaceColor,
          accent_color: existing.accentColor,
          hero_gradient_enabled: existing.heroGradientEnabled,
          hero_gradient_start: existing.heroGradientStart,
          hero_gradient_end: existing.heroGradientEnd,
          hero_gradient_angle: existing.heroGradientAngle,
          button_gradient_enabled: existing.buttonGradientEnabled,
          button_gradient_start: existing.buttonGradientStart,
          button_gradient_end: existing.buttonGradientEnd,
          button_gradient_angle: existing.buttonGradientAngle,
          updated_at: existing.updatedAt?.toISOString(),
        };
      }

      // If no row exists yet, insert default
      const [inserted] = await db
        .insert(siteThemes)
        .values({
          themeKey: defaultSiteTheme.theme_key,
          presetName: defaultSiteTheme.preset_name,
          primaryColor: defaultSiteTheme.primary_color,
          primaryHoverColor: defaultSiteTheme.primary_hover_color,
          buttonTextColor: defaultSiteTheme.button_text_color,
          bgColor: defaultSiteTheme.bg_color,
          surfaceColor: defaultSiteTheme.surface_color,
          accentColor: defaultSiteTheme.accent_color,
          heroGradientEnabled: defaultSiteTheme.hero_gradient_enabled,
          heroGradientStart: defaultSiteTheme.hero_gradient_start,
          heroGradientEnd: defaultSiteTheme.hero_gradient_end,
          heroGradientAngle: defaultSiteTheme.hero_gradient_angle,
          buttonGradientEnabled: defaultSiteTheme.button_gradient_enabled,
          buttonGradientStart: defaultSiteTheme.button_gradient_start,
          buttonGradientEnd: defaultSiteTheme.button_gradient_end,
          buttonGradientAngle: defaultSiteTheme.button_gradient_angle,
        })
        .onConflictDoNothing()
        .returning();

      const themeRow = inserted || (await db.select().from(siteThemes).where(eq(siteThemes.themeKey, 'default')).limit(1))[0];

      if (themeRow) {
        return {
          id: themeRow.id,
          theme_key: themeRow.themeKey,
          preset_name: themeRow.presetName,
          primary_color: themeRow.primaryColor,
          primary_hover_color: themeRow.primaryHoverColor,
          button_text_color: themeRow.buttonTextColor,
          bg_color: themeRow.bgColor,
          surface_color: themeRow.surfaceColor,
          accent_color: themeRow.accentColor,
          hero_gradient_enabled: themeRow.heroGradientEnabled,
          hero_gradient_start: themeRow.heroGradientStart,
          hero_gradient_end: themeRow.heroGradientEnd,
          hero_gradient_angle: themeRow.heroGradientAngle,
          button_gradient_enabled: themeRow.buttonGradientEnabled,
          button_gradient_start: themeRow.buttonGradientStart,
          button_gradient_end: themeRow.buttonGradientEnd,
          button_gradient_angle: themeRow.buttonGradientAngle,
          updated_at: themeRow.updatedAt?.toISOString(),
        };
      }
    } catch (_err) {
      console.warn('DB table siteThemes query failed, falling back to memory/default:', _err);
    }
  }

  if (isMemoryBackendAllowed()) {
    return await getMemorySiteTheme();
  }

  return defaultSiteTheme;
}

export async function updateSiteTheme(updates: Partial<SiteTheme>): Promise<{ success: boolean; theme?: SiteTheme }> {
  if (db) {
    try {
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (updates.preset_name !== undefined) updateData.presetName = updates.preset_name;
      if (updates.primary_color !== undefined) updateData.primaryColor = updates.primary_color;
      if (updates.primary_hover_color !== undefined) updateData.primaryHoverColor = updates.primary_hover_color;
      if (updates.button_text_color !== undefined) updateData.buttonTextColor = updates.button_text_color;
      if (updates.bg_color !== undefined) updateData.bgColor = updates.bg_color;
      if (updates.surface_color !== undefined) updateData.surfaceColor = updates.surface_color;
      if (updates.accent_color !== undefined) updateData.accentColor = updates.accent_color;
      if (updates.hero_gradient_enabled !== undefined) updateData.heroGradientEnabled = updates.hero_gradient_enabled;
      if (updates.hero_gradient_start !== undefined) updateData.heroGradientStart = updates.hero_gradient_start;
      if (updates.hero_gradient_end !== undefined) updateData.heroGradientEnd = updates.hero_gradient_end;
      if (updates.hero_gradient_angle !== undefined) updateData.heroGradientAngle = updates.hero_gradient_angle;
      if (updates.button_gradient_enabled !== undefined) updateData.buttonGradientEnabled = updates.button_gradient_enabled;
      if (updates.button_gradient_start !== undefined) updateData.buttonGradientStart = updates.button_gradient_start;
      if (updates.button_gradient_end !== undefined) updateData.buttonGradientEnd = updates.button_gradient_end;
      if (updates.button_gradient_angle !== undefined) updateData.buttonGradientAngle = updates.button_gradient_angle;

      const [updated] = await db
        .update(siteThemes)
        .set(updateData)
        .where(eq(siteThemes.themeKey, 'default'))
        .returning();

      if (updated) {
        return {
          success: true,
          theme: {
            id: updated.id,
            theme_key: updated.themeKey,
            preset_name: updated.presetName,
            primary_color: updated.primaryColor,
            primary_hover_color: updated.primaryHoverColor,
            button_text_color: updated.buttonTextColor,
            bg_color: updated.bgColor,
            surface_color: updated.surfaceColor,
            accent_color: updated.accentColor,
            hero_gradient_enabled: updated.heroGradientEnabled,
            hero_gradient_start: updated.heroGradientStart,
            hero_gradient_end: updated.heroGradientEnd,
            hero_gradient_angle: updated.heroGradientAngle,
            button_gradient_enabled: updated.buttonGradientEnabled,
            button_gradient_start: updated.buttonGradientStart,
            button_gradient_end: updated.buttonGradientEnd,
            button_gradient_angle: updated.buttonGradientAngle,
            updated_at: updated.updatedAt?.toISOString(),
          },
        };
      }
    } catch (_err) {
      console.warn('DB update siteThemes failed, updating in-memory:', _err);
    }
  }

  if (isMemoryBackendAllowed()) {
    const theme = await updateMemorySiteTheme(updates);
    return { success: true, theme };
  }

  return { success: false };
}
