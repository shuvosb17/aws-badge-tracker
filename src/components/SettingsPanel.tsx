import { BellRing, Download, RefreshCw, RotateCcw, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Update } from '../lib/actions'
import { cx } from '../lib/cx'
import { buildReminderCalendar, downloadFile } from '../lib/ics'
import { defaultState, normalizeState } from '../lib/storage'
import type { AppState } from '../types'
import { Button, Card, SectionTitle } from './ui'

interface Props {
  state: AppState
  update: Update
  today: string
  onRerunSetup: () => void
}

export function SettingsPanel({ state, update, today, onRerunSetup }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  const flash = (m: string) => {
    setMessage(m)
    setTimeout(() => setMessage(null), 3000)
  }

  const importData = async (file: File) => {
    try {
      const restored = normalizeState(JSON.parse(await file.text()))
      update(() => restored)
      flash('Backup restored.')
    } catch {
      flash('That file is not a valid tracker backup.')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Settings</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <SectionTitle hint="Tell the tracker which badges and streaks you already have">Sync with your profile</SectionTitle>
          <Button variant="primary" onClick={onRerunSetup}>
            <RefreshCw size={16} /> Re-run setup
          </Button>
          <label className="mt-5 block text-sm">
            <span className="font-semibold text-slate-300">Challenge start date</span>
            <input
              type="date"
              value={state.startDate ?? ''}
              max={today}
              onChange={(e) => update((s) => ({ ...s, startDate: e.target.value || null }))}
              className="field mt-1.5"
            />
          </label>
        </Card>

        <Card>
          <SectionTitle hint="AWS doesn't say which time zone streaks use">When does your day end?</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {(['local', 'utc'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => update((s) => ({ ...s, dayBoundary: b }))}
                className={cx(
                  'rounded-2xl p-3.5 text-left ring-1 transition',
                  state.dayBoundary === b ? 'bg-aws/10 ring-aws/50' : 'bg-white/[0.03] ring-white/10 hover:ring-white/25',
                )}
              >
                <div className="font-semibold">{b === 'local' ? 'Local midnight' : 'UTC midnight'}</div>
                <div className="mt-0.5 text-xs text-slate-400">{b === 'local' ? 'Your device time zone' : 'Safer if you\'re unsure'}</div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Doing your missions at the same time every day keeps you safe either way.</p>
        </Card>

        <Card>
          <SectionTitle hint="Daily and weekly reminders for Google, Outlook or Apple Calendar">Never miss a day</SectionTitle>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="font-semibold text-slate-300">Remind me at</span>
              <input
                type="time"
                value={state.reminderTime}
                onChange={(e) => update((s) => ({ ...s, reminderTime: e.target.value || '20:00' }))}
                className="field mt-1.5 w-36"
              />
            </label>
            <Button
              variant="primary"
              onClick={() => {
                downloadFile('aws-badge-reminders.ics', buildReminderCalendar(today, state.reminderTime), 'text/calendar')
                flash('Calendar file downloaded. Open it to add the reminders.')
              }}
            >
              <BellRing size={16} /> Add to calendar
            </Button>
          </div>
        </Card>

        <Card>
          <SectionTitle hint="Stored only in this browser. Back up to move devices.">Your data</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                downloadFile(`aws-badge-tracker-${today}.json`, JSON.stringify(state, null, 2), 'application/json')
                flash('Backup downloaded.')
              }}
            >
              <Download size={16} /> Back up
            </Button>
            <Button onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Restore
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Reset all progress? This cannot be undone unless you have a backup.')) {
                  update(() => defaultState())
                  flash('Progress reset.')
                }
              }}
            >
              <RotateCcw size={16} /> Reset
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
        </Card>
      </div>

      {message && (
        <div className="animate-rise fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-2xl bg-ink-3 px-4 py-3 text-sm font-medium shadow-2xl ring-1 ring-white/10 sm:bottom-8">
          {message}
        </div>
      )}
    </div>
  )
}
