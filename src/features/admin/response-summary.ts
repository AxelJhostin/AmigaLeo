export type ResponseStatus = 'pending' | 'attending' | 'declined';

export function groupResponses<T extends { status: ResponseStatus; display_name: string }>(guests: T[]): Record<ResponseStatus, T[]> {
  const groups: Record<ResponseStatus, T[]> = { attending: [], declined: [], pending: [] };
  for (const guest of guests) groups[guest.status].push(guest);
  for (const group of Object.values(groups)) group.sort((a, b) => a.display_name.localeCompare(b.display_name, 'es'));
  return groups;
}
