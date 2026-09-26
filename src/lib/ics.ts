function stamp(key: string, time: string): string {
  return `${key.replaceAll('-', '')}T${time.replace(':', '')}00`
}

function event(uid: string, start: string, rrule: string, summary: string, description: string): string[] {
  return [
    'BEGIN:VEVENT',
    `UID:${uid}@aws-badge-tracker`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${start}`,
    'DURATION:PT15M',
    `RRULE:${rrule}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'URL:https://builder.aws.com',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${summary}`,
    'END:VALARM',
    'END:VEVENT',
  ]
}

/** Floating-time events so the reminder fires at the same wall-clock time wherever the user is. */
export function buildReminderCalendar(today: string, time: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AWS Badge Tracker//EN',
    'CALSCALE:GREGORIAN',
    ...event(
      `daily-${today}`,
      stamp(today, time),
      'FREQ=DAILY;COUNT=100',
      'AWS Builder Center: visit + like + comment',
      'Keep your streaks alive: open builder.aws.com\\, like one post\\, leave one thoughtful comment\\, then check in on your tracker.',
    ),
    ...event(
      `weekly-${today}`,
      stamp(today, time),
      'FREQ=WEEKLY;COUNT=13',
      'AWS Builder Center: publish article + vote on a Wish',
      'Weekly tasks: publish one article and vote on at least one Wish.',
    ),
    'END:VCALENDAR',
  ]
  return lines.join('\r\n')
}

export function downloadFile(filename: string, contents: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
