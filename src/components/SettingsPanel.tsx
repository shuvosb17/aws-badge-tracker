import { useRef, useState } from 'react'
import type { Update } from '../lib/actions'
import { buildReminderCalendar, downloadFile } from '../lib/ics'
import { defaultState, normalizeState } from '../lib/storage'
import type { AppState } from '../types'
import { cx } from '../lib/cx'
import { Button, Card, CardTitle } from './ui'

export function SettingsPanel({ state, update, today }: { state: AppState; update: Update; today: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  const flash = (m: string) => {
    setMessage(m)
    setTimeout(() => setMessage(null), 3000)
  }

  const exportData = () => {
    downloadFile(`aws-badge-tracker-${today}.json`, JSON.stringify(state, null, 2), 'application/json')
    flash('Backup downloaded.')
  }

  const importData = async (file: File) => {
    try {
      const parsed = normalizeState(JSON.parse(await file.text()))
      update(() => parsed)
      flash('Backup restored.')
    } catch {
      flash('That file is not a valid tracker backup.')
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardTitle>Challenge</CardTitle>
        <label className="block text-sm">
          <span className="text-slate-300">Start date</span>
          <input
            type="date"
            value={state.startDate ?? ''}
            max={today}
            onChange={(e) => update((s) => ({ ...s, startDate: e.target.value || null }))}
            className="mt-1 block w-full rounded-lg border border-white/10 bg-ink-3 px-3 py-2"
          />
        </label>

        <div className="mt-5 text-sm">
          <span className="text-slate-300">When does a day end?</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(['local', 'utc'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => update((s) => ({ ...s, dayBoundary: b }))}
                className={cx(
                  'rounded-lg border px-3 py-2 text-left',
                  state.dayBoundary === b ? 'border-aws bg-aws/15' : 'border-white/10 bg-white/5 hover:border-white/25',
                )}
              >
                <div className="font-semibold">{b === 'local' ? 'Local midnight' : 'UTC midnight'}</div>
                <div className="text-xs text-slate-400">{b === 'local' ? 'Your device time zone' : 'Safer if unsure how AWS counts days'}</div>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            AWS doesn't document which time zone streaks use. Doing your activities at the same time every day keeps you safe
            either way.
          </p>
        </div>
      </Card>

      <Card>
        <CardTitle>Reminders</CardTitle>
        <p className="text-sm text-slate-400">
          Add a daily reminder (visit, like, comment) and a weekly reminder (article + Wish vote) to Google Calendar, Outlook or
          Apple Calendar.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="text-slate-300">Reminder time</span>
            <input
              type="time"
              value={state.reminderTime}
              onChange={(e) => update((s) => ({ ...s, reminderTime: e.target.value || '20:00' }))}
              className="mt-1 block rounded-lg border border-white/10 bg-ink-3 px-3 py-2"
            />
          </label>
          <Button
            variant="primary"
            onClick={() => {
              downloadFile('aws-badge-reminders.ics', buildReminderCalendar(today, state.reminderTime), 'text/calendar')
              flash('Calendar file downloaded. Open it to add the reminders.')
            }}
          >
            Download calendar reminders (.ics)
          </Button>
        </div>
      </Card>

      <Card className="md:col-span-2">
        <CardTitle>Your data</CardTitle>
        <p className="text-sm text-slate-400">
          Everything is stored in this browser only. There's no account and nothing is sent to a server. Download a backup to move
          your progress to another device.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={exportData}>Download backup (.json)</Button>
          <Button onClick={() => fileRef.current?.click()}>Restore from backup</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm('Reset all progress? This cannot be undone unless you have a backup.')) {
                update(() => defaultState())
                flash('Progress reset.')
              }
            }}
          >
            Reset everything
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importData(f)
              e.target.value = ''
            }}
          />
        </div>
        {message && <p className="mt-3 text-sm text-aws">{message}</p>}
      </Card>
    </div>
  )
}
