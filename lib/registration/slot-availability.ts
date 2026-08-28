export type SlotAvailability = {
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
  remainingCapacity: number;
};

/** A slot is selectable only while the server reports remaining capacity. */
export function isTimeSlotSelectable(slot: SlotAvailability): boolean {
  return slot.status !== 'FULL' && slot.remainingCapacity > 0;
}
