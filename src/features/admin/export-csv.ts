export type GuestForExport = {
  display_name: string;
  status: 'pending' | 'attending' | 'declined';
  companion_allowed: boolean;
  companion_name: string | null;
  companion_attending: boolean;
};

// Protege los nombres frente a fórmulas al abrir el archivo en una hoja de cálculo.
function csvCell(value: string): string {
  const safe = /^[\s\u0000-\u001f\ufeff]*[=+\-@]/u.test(value) || /^[\t\r\n]/u.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function guestsToCsv(guests: GuestForExport[]): string {
  const labels = { pending: 'Pendiente', attending: 'Confirmó', declined: 'No asistirá' } as const;
  const rows = [
    ['Invitado', 'Respuesta', 'Acompañante permitido', 'Nombre del acompañante', 'Acompañante confirmado'],
    ...guests.map(guest => [
      guest.display_name,
      labels[guest.status],
      guest.companion_allowed ? 'Sí' : 'No',
      guest.companion_name || '',
      guest.status === 'attending' ? (guest.companion_attending ? 'Sí' : 'No') : '—',
    ]),
  ];
  return `\ufeff${rows.map(row => row.map(csvCell).join(',')).join('\r\n')}\r\n`;
}
