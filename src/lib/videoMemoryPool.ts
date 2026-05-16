/** Limit decoded video buffers — evicts oldest when a third video claims a slot. */
const MAX_ACTIVE_VIDEOS = 2;

type Slot = { id: string; evict: () => void };

const slots: Slot[] = [];

export function claimVideoSlot(id: string, evict: () => void): void {
  const existing = slots.findIndex((s) => s.id === id);
  if (existing >= 0) slots.splice(existing, 1);

  while (slots.length >= MAX_ACTIVE_VIDEOS) {
    const victim = slots.shift()!;
    victim.evict();
  }

  slots.push({ id, evict });
}

export function releaseVideoSlot(id: string): void {
  const idx = slots.findIndex((s) => s.id === id);
  if (idx >= 0) slots.splice(idx, 1);
}
