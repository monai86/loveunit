import { redirect } from 'next/navigation';

/**
 * Queue calling was retired from the staff workflow. Keep the old URL alive
 * so bookmarks and cached PWA links land on the staff overview.
 */
export default function RetiredQueueRoute() {
  redirect('/staff/overview');
}
