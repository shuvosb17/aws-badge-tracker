import { Check, Copy, ExternalLink, Heart, Lightbulb, MessageCircle, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { ARTICLE_IDEAS, COMMENT_PROMPTS, WISH_IDEAS } from '../data/content'
import { setActivity, uid, type Update } from '../lib/actions'
import { cx } from '../lib/cx'
import { formatKey, weekKey } from '../lib/date'
import type { AppState, Article, ArticleStatus } from '../types'
import { Button, Card, SectionTitle, Stepper } from './ui'

const STATUSES: { id: ArticleStatus; label: string; style: string }[] = [
  { id: 'idea', label: 'Idea', style: 'bg-white/[0.08] text-slate-300' },
  { id: 'drafting', label: 'Drafting', style: 'bg-sky-400/15 text-sky-300' },
  { id: 'published', label: 'Published', style: 'bg-emerald-400/15 text-emerald-300' },
]

export function ContentPanel({ state, update, today }: { state: AppState; update: Update; today: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Toolkit</h1>
        <p className="mt-1 text-sm text-slate-400">
          Everything you need for the article, comment and Wish badges. Plan it here, then post it on Builder Center.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ArticlePlanner state={state} update={update} today={today} />
        <div className="space-y-6">
          <CopyList
            icon={<MessageCircle size={18} />}
            title="Comments that get replies"
            hint="For Conversation Starter (10 comments with replies). Tap to copy, then fill in the blanks."
            items={COMMENT_PROMPTS}
          />
          <CopyList
            icon={<Lightbulb size={18} />}
            title="Wish ideas"
            hint="For First Wish and Idea Influencer (10 votes on your Wishes)."
            items={WISH_IDEAS}
          />
        </div>
      </div>
    </div>
  )
}

function ArticlePlanner({ state, update, today }: { state: AppState; update: Update; today: string }) {
  const [title, setTitle] = useState('')
  const articles = state.articles
  const published = articles.filter((a) => a.status === 'published')
  const thisWeek = published.some((a) => a.publishedOn && weekKey(a.publishedOn) === weekKey(today))
  const liked = published.filter((a) => a.likes >= 10).length
  const used = new Set(articles.map((a) => a.title))

  const patch = (id: string, fn: (a: Article) => Article) =>
    update((s) => ({ ...s, articles: s.articles.map((a) => (a.id === id ? fn(a) : a)) }))

  const add = (t: string) => {
    const clean = t.trim()
    if (!clean) return
    update((s) => ({ ...s, articles: [...s.articles, { id: uid(), title: clean, status: 'idea', likes: 0 }] }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    add(title)
    setTitle('')
  }

  const setStatus = (a: Article, status: ArticleStatus) => {
    if (status === 'published' && a.status !== 'published') {
      update((s) =>
        setActivity(
          { ...s, articles: s.articles.map((x) => (x.id === a.id ? { ...x, status, publishedOn: today } : x)) },
          today,
          'publish',
          true,
        ),
      )
    } else {
      patch(a.id, (x) => ({ ...x, status }))
    }
  }

  return (
    <Card>
      <SectionTitle hint="One article a week for 4 weeks, and 5 articles with 10+ likes each">Article planner</SectionTitle>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <MiniStat label="This week" value={thisWeek ? 'Published' : 'Not yet'} good={thisWeek} />
        <MiniStat label="Published" value={String(published.length)} good={published.length > 0} />
        <MiniStat label="10+ likes" value={`${liked}/5`} good={liked >= 5} />
      </div>

      <form onSubmit={submit} className="mb-4 flex gap-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New article title…" className="field" />
        <Button type="submit" variant="primary" disabled={!title.trim()}>
          <Plus size={16} /> Add
        </Button>
      </form>

      {articles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
          No articles yet. Pick an idea below to get started.
        </p>
      ) : (
        <ul className="space-y-2">
          {articles.map((a) => (
            <li key={a.id} className="rounded-2xl bg-white/[0.03] p-3.5 ring-1 ring-white/[0.07]">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1 font-semibold">{a.title}</div>
                <button
                  type="button"
                  onClick={() => update((s) => ({ ...s, articles: s.articles.filter((x) => x.id !== a.id) }))}
                  className="rounded-lg p-1 text-slate-500 hover:bg-white/10 hover:text-rose-300"
                  aria-label="Delete article"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {STATUSES.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(a, st.id)}
                    className={cx(
                      'rounded-lg px-2.5 py-1 text-xs font-semibold transition',
                      a.status === st.id ? st.style : 'text-slate-500 hover:bg-white/[0.06] hover:text-slate-300',
                    )}
                  >
                    {st.label}
                  </button>
                ))}
                {a.publishedOn && <span className="text-xs text-slate-500">on {formatKey(a.publishedOn)}</span>}
              </div>
              {a.status === 'published' && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    value={a.url ?? ''}
                    onChange={(e) => patch(a.id, (x) => ({ ...x, url: e.target.value }))}
                    placeholder="Paste the article link"
                    className="field min-w-0 flex-1 py-1.5 text-xs"
                  />
                  {a.url && (
                    <a href={a.url} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-aws hover:bg-aws/10" aria-label="Open article">
                      <ExternalLink size={15} />
                    </a>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Heart size={14} className={a.likes >= 10 ? 'text-rose-400' : ''} />
                    <Stepper value={a.likes} onChange={(v) => patch(a.id, (x) => ({ ...x, likes: v }))} />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Article ideas · tap to add</div>
        <div className="flex flex-wrap gap-2">
          {ARTICLE_IDEAS.filter((i) => !used.has(i)).map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => add(idea)}
              className="rounded-xl bg-white/[0.03] px-3 py-1.5 text-left text-xs text-slate-300 ring-1 ring-white/[0.08] transition hover:bg-aws/10 hover:text-white hover:ring-aws/40"
            >
              + {idea}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}

function MiniStat({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/[0.07]">
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className={cx('mt-0.5 font-bold', good ? 'text-emerald-300' : 'text-slate-200')}>{value}</div>
    </div>
  )
}

function CopyList({ icon, title, hint, items }: { icon: ReactNode; title: string; hint: string; items: string[] }) {
  const [copied, setCopied] = useState<number | null>(null)
  const copy = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500)
  }
  return (
    <Card>
      <SectionTitle hint={hint}>
        <span className="flex items-center gap-2">
          <span className="text-aws">{icon}</span> {title}
        </span>
      </SectionTitle>
      <ul className="space-y-2">
        {items.map((text, i) => (
          <li key={text}>
            <button
              type="button"
              onClick={() => copy(text, i)}
              className="group flex w-full items-start gap-3 rounded-2xl bg-white/[0.03] p-3 text-left text-sm text-slate-200 ring-1 ring-white/[0.06] transition hover:ring-aws/40"
            >
              <span className="flex-1">{text}</span>
              <span className={cx('mt-0.5 shrink-0', copied === i ? 'text-emerald-300' : 'text-slate-500 group-hover:text-aws')}>
                {copied === i ? <Check size={16} /> : <Copy size={16} />}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
