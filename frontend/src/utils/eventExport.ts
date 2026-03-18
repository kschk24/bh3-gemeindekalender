import { Event } from '../types';

interface PdfLabels {
  dateTime: string;
  location: string;
  description: string;
  accessibility: string;
  accessLabels: {
    wheelchair: string;
    hearingLoop: string;
    signLanguage: string;
    easyLanguage: string;
  };
}

function toIcalDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function escapeIcal(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function exportEventToIcal(event: Event): void {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const now = new Date();

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gemeindekalender//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.id}@gemeindekalender`,
    `DTSTAMP:${toIcalDate(now)}`,
    `DTSTART:${toIcalDate(start)}`,
    `DTEND:${toIcalDate(end)}`,
    `SUMMARY:${escapeIcal(event.title)}`,
    `DESCRIPTION:${escapeIcal(event.description)}`,
    `LOCATION:${escapeIcal([event.location, event.address].filter(Boolean).join(', '))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_') || 'event'}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportEventsToIcal(events: Event[]): void {
  if (events.length === 0) return;

  const now = new Date();
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Gemeindekalender//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  for (const event of events) {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@gemeindekalender`,
      `DTSTAMP:${toIcalDate(now)}`,
      `DTSTART:${toIcalDate(start)}`,
      `DTEND:${toIcalDate(end)}`,
      `SUMMARY:${escapeIcal(event.title)}`,
      `DESCRIPTION:${escapeIcal(event.description)}`,
      `LOCATION:${escapeIcal([event.location, event.address].filter(Boolean).join(', '))}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');

  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'favoriten.ics';
  a.click();
  URL.revokeObjectURL(url);
}

export function exportEventToPdf(
  event: Event,
  dateStr: string,
  timeStr: string,
  labels: PdfLabels,
  lang: string,
): void {
  const accessItems: string[] = [];
  if (event.accessibility?.wheelchairAccessible) accessItems.push(labels.accessLabels.wheelchair);
  if (event.accessibility?.hearingLoop) accessItems.push(labels.accessLabels.hearingLoop);
  if (event.accessibility?.signLanguage) accessItems.push(labels.accessLabels.signLanguage);
  if (event.accessibility?.easyLanguage) accessItems.push(labels.accessLabels.easyLanguage);

  const categoryColor = event.category?.color ?? '#6b7280';
  const categoryName = event.category?.name ?? '';

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(event.title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; color: #111; max-width: 680px; margin: 2rem auto; padding: 0 1.5rem; line-height: 1.6; }
    .print-btn { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; padding: 0.5rem 1rem; background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 0.9rem; color: #374151; }
    .print-btn:hover { background: #e5e7eb; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; color: #fff; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.75rem; background-color: ${categoryColor}; }
    h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 1.25rem 0; }
    .section { margin-bottom: 1.25rem; }
    .label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.3rem; }
    .value { font-size: 1rem; }
    .value .sub { font-size: 0.9rem; color: #6b7280; }
    .description { white-space: pre-line; font-size: 0.95rem; color: #374151; }
    .access-list { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.4rem; }
    .access-badge { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 2px 8px; font-size: 0.85rem; color: #166534; }
    .footer { margin-top: 2rem; font-size: 0.75rem; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 0.75rem; }
    @media print { .print-btn { display: none; } body { margin: 0; } }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
    Drucken / Print / Imprimer
  </button>

  <div class="badge">${escapeHtml(categoryName)}</div>
  <h1>${escapeHtml(event.title)}</h1>
  <hr class="divider">

  <div class="section">
    <div class="label">${escapeHtml(labels.dateTime)}</div>
    <div class="value">${escapeHtml(dateStr)}<br>${escapeHtml(timeStr)}</div>
  </div>

  <div class="section">
    <div class="label">${escapeHtml(labels.location)}</div>
    <div class="value">
      ${escapeHtml(event.location)}
      ${event.address ? `<br><span class="sub">${escapeHtml(event.address)}</span>` : ''}
    </div>
  </div>

  <hr class="divider">

  <div class="section">
    <div class="label">${escapeHtml(labels.description)}</div>
    <div class="description">${escapeHtml(event.description)}</div>
  </div>

  ${
    accessItems.length > 0
      ? `<hr class="divider">
  <div class="section">
    <div class="label">${escapeHtml(labels.accessibility)}</div>
    <div class="access-list">${accessItems.map((a) => `<span class="access-badge">${escapeHtml(a)}</span>`).join('')}</div>
  </div>`
      : ''
  }

  <div class="footer">Gemeindekalender</div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
