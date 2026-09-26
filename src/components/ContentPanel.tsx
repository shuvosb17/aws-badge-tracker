import { useState, type FormEvent } from 'react'
import { ARTICLE_IDEAS, COMMENT_PROMPTS, WISH_IDEAS } from '../data/content'
import { setActivity, uid, type Update } from '../lib/actions'
import { formatKey, weekKey } from '../lib/date'
import type { AppState, Article, ArticleStatus } from '../types'
import { cx } from '../lib/cx'
import { Button, Card, CardTitle, Stepper } from './ui'

const STATUS_STYLES: Record<ArticleStatus, string> = {
  idea: 'bg-white/10 text-slate-300',
  drafting: 'bg-sky-400/15 text-sky-300',
  published: 'bg-emerald-400/15 text-emerald-300',
}

export function ContentPanel({ state, update, today }: { state: AppState; update: Update; today: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <ArticlePlanner state={state} update={update} today={today} />
      <div className="space-y-6">
        <CopyList
          title="Comment prompts that get replies"
          subtitle="Conversation Starter needs 10 comments with replies. End every comment with a specific question."
          items={COMMENT_PROMPTS}
        />
        <CopyList
          title="Wish ideas"
          subtitle="Idea Influencer needs 10 votes. Pick Wishes other builders will actually want."
          items={WISH_IDEAS}
        />
      </div>
    </div>
  )
}

function ArticlePlanner({ state, update, today }: { state: AppState; update: Update; today: string }) {
  const [title, setTitle] = useState('')
  const articles = state.articles
  const published = articles.filter((a) => a.status === 'published')
  const thisWeek = published.some((a) => a.publishedOn && weekKey(a.publishedOn) === weekKey(today))
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

  const publish = (a: Article) =>
    update((s) =>
      setActivity(
        { ...s, articles: s.articles.map((x) => (x.id === a.id ? { ...x, status: 'published', publishedOn: today } : x)) },
        today,
        'publish',
        true,
      ),
    )

  return (
    <Card>
      <CardTitle
        right={
          <span className={cx('rounded-full px-2.5 py-1 text-xs font-semibold', thisWeek ? STATUS_STYLES.published : 'bg-amber-400/15 text-amber-300')}>
            {thisWeek ? '✓ Published this week' : 'Nothing published this week'}
          </span>
        }
      >
        Article planner
      </CardTitle>
      <p className="mb-4 text-sm text-slate-400">
        One article a week for 4 weeks earns 4-Week Article Publishing. Five articles with 10+ likes earns Valued Creator. Track
        likes here and that badge updates automatically.
      </p>

      <form onSubmit={submit} className="mb-4 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Article title…"
          className="flex-1 rounded-lg border border-white/10 bg-ink-3 px-3 py-2 text-sm placeholder:text-slate-500"
        />
        <Button type="submit" variant="primary" disabled={!title.trim()}>
          Add
        </Button>
      </form>

      {articles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-400">
          No articles yet. Add one of the ideas below to get started.
        </p>
      ) : (
        <ul className="space-y-2">
          {articles.map((a) => (
            <li key={a.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{a.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <select
                      value={a.status}
                      onChange={(e) => {
                        const status = e.target.value as ArticleStatus
                        if (status === 'published' && a.status !== 'published') publish(a)
                        else patch(a.id, (x) => ({ ...x, status }))
                      }}
                      className={cx('rounded-md border-0 px-2 py-0.5 text-xs font-semibold', STATUS_STYLES[a.status])}
                    >
                      <option value="idea">Idea</option>
                      <option value="drafting">Drafting</option>
                      <option value="published">Published</option>
                    </select>
                    {a.publishedOn && <span className="text-slate-400">on {formatKey(a.publishedOn)}</span>}
                    {a.url && (
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-aws hover:underline">
                        View ↗
                      </a>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update((s) => ({ ...s, articles: s.articles.filter((x) => x.id !== a.id) }))}
                  className="text-slate-500 hover:text-rose-300"
                  aria-label="Delete article"
                >
                  ✕
                </button>
              </div>
              {a.status === 'published' && (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <input
                    value={a.url ?? ''}
                    onChange={(e) => patch(a.id, (x) => ({ ...x, url: e.target.value }))}
                    placeholder="https://builder.aws.com/content/…"
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-ink-3 px-2 py-1 text-xs placeholder:text-slate-600"
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Stepper value={a.likes} onChange={(v) => patch(a.id, (x) => ({ ...x, likes: v }))} />
                    likes {a.likes >= 10 && <span className="text-emerald-300">✓ 10+</span>}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Ideas (click to add)</div>
        <div className="flex flex-wrap gap-2">
          {ARTICLE_IDEAS.filter((i) => !used.has(i)).map((idea) => (
            <button
              key={idea}
              type="button"
              onClick={() => add(idea)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-left text-xs text-slate-300 hover:border-aws/50 hover:text-white"
            >
              + {idea}
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}

function CopyList({ title, subtitle, items }: { title: string; subtitle: string; items: string[] }) {
  const [copied, setCopied] = useState<number | null>(null)
  const copy = async (text: string, i: number) => {
    await navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied((c) => (c === i ? null : c)), 1500)
  }
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <p className="mb-3 text-sm text-slate-400">{subtitle}</p>
      <ul className="space-y-2">
        {items.map((text, i) => (
          <li key={text}>
            <button
              type="button"
              onClick={() => copy(text, i)}
              className="group w-full rounded-lg border border-white/5 bg-white/5 p-3 text-left text-sm text-slate-200 hover:border-aws/40"
            >
              {text}
              <span className="mt-1 block text-[11px] text-slate-500 group-hover:text-aws">{copied === i ? '✓ Copied' : 'Click to copy'}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
