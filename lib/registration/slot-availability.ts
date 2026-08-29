export type SlotAvailability = {
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
  remainingCapacity: number;
};

/** Arrival windows are guidance only; every active slot accepts registrations. */
export function isTimeSlotSelectable(_slot: SlotAvailability): boolean {
  return true;
}
