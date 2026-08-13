// Offline action queue for staff tablets.
//
// Venue WiFi is unreliable on event day, so critical actions (check-in, start,
// complete, cancel) are buffered in localStorage when the device is offline and
// replayed against the server once connectivity returns. The QR scanner itself
// is fully client-side (html5-qrcode), so scanning keeps working offline too.

export interface OfflineAction {
  id: string;
  endpoint: string;
  method: 'POST';
  body: unknown;
  createdAt: string;
  label: string;
}

const QUEUE_KEY = 'mumt_offline_action_queue';

function readQueue(): OfflineAction[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineAction[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineAction[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage full / private mode — drop rather than crash the tablet.
  }
}

/** Adds an action to the offline queue. Returns the new pending count. */
export function enqueueOfflineAction(action: Omit<OfflineAction, 'id' | 'createdAt'>): number {
  const queue = readQueue();
  const entry: OfflineAction = {
    ...action,
    id: `off-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  queue.push(entry);
  writeQueue(queue);
  notifyListeners(queue.length);
  return queue.length;
}

/** Number of actions currently waiting to sync. */
export function getPendingActionCount(): number {
  return readQueue().length;
}

/** Removes a single action (after a successful replay). */
export function removeOfflineAction(id: string): number {
  const queue = readQueue().filter((a) => a.id !== id);
  writeQueue(queue);
  notifyListeners(queue.length);
  return queue.length;
}

/** Replays every queued action in FIFO order. Returns { synced, failed }. */
export async function flushOfflineQueue(): Promise<{ synced: number; failed: number }> {
  const queue = readQueue();
  let synced = 0;
  let failed = 0;

  for (const action of queue) {
    try {
      const res = await fetch(action.endpoint, {
        method: action.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.body),
      });
      if (res.ok) {
        removeOfflineAction(action.id);
        synced += 1;
      } else {
        // Server rejected it (e.g. invalid transition) — drop it so the queue
        // does not jam forever; the staff member sees the result via the UI.
        removeOfflineAction(action.id);
        failed += 1;
      }
    } catch {
      // Still offline — keep this action queued and try again later.
      failed += 1;
    }
  }
  return { synced, failed };
}

// ---- React hook ----

type Listener = (count: number) => void;
const listeners = new Set<Listener>();

function notifyListeners(count: number) {
  listeners.forEach((l) => l(count));
}

export function subscribePendingCount(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
