import { db } from '@/db';
import { eventContentBlocks } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { isMemoryBackendAllowed, updateEventContentBlock as memoryUpdateContentBlock, defaultContentBlocks } from '@/lib/db/store';

export async function getAdminContentBlocks(eventId: string) {
  if (db) {
    return await db
      .select()
      .from(eventContentBlocks)
      .where(eq(eventContentBlocks.eventId, eventId))
      .orderBy(asc(eventContentBlocks.displayOrder));
  }

  if (isMemoryBackendAllowed()) {
    return defaultContentBlocks.sort((a, b) => a.display_order - b.display_order);
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}

export async function updateEventContentBlock(id: string, updates: Partial<{
  title: string;
  description: string;
  imageUrl: string | null;
  altText: string | null;
  isVisible: boolean;
  displayOrder: number;
}>) {
  if (db) {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl;
    if (updates.altText !== undefined) updateData.altText = updates.altText;
    if (updates.isVisible !== undefined) updateData.isVisible = updates.isVisible;
    if (updates.displayOrder !== undefined) updateData.displayOrder = updates.displayOrder;

    const [updated] = await db
      .update(eventContentBlocks)
      .set(updateData)
      .where(eq(eventContentBlocks.id, id))
      .returning();

    if (updated) {
      return { success: true, block: updated };
    }
  }

  if (isMemoryBackendAllowed()) {
    return await memoryUpdateContentBlock(id, {
      title: updates.title,
      description: updates.description,
      image_url: updates.imageUrl,
      alt_text: updates.altText,
      is_visible: updates.isVisible,
      display_order: updates.displayOrder,
    });
  }

  throw new Error('DATABASE_URL is unconfigured in production environment.');
}
