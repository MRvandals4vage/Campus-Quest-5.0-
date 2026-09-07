// Deadline: 12:00 AM IST tonight (Sept 8, 2026 00:00 IST = Sept 7, 2026 18:30 UTC)
export const REGISTRATION_DEADLINE_ISO = "2026-09-08T00:00:00+05:30";
export const REGISTRATION_DEADLINE = new Date(REGISTRATION_DEADLINE_ISO).getTime();

export function isRegistrationClosed(): boolean {
  return Date.now() >= REGISTRATION_DEADLINE;
}
