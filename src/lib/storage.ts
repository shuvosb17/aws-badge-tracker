import { useEffect, useState } from 'react'
import type { AppState } from '../types'

const STORAGE_KEY = 'aws-badge-tracker:v1'

export function defaultState(): AppState {
  return {
    version: 1,
    startDate: null,
    dayBoundary: 'local',
    reminderTime: '20:00',
    daily: {},
    quick: {},
    community: {
      commentsWithReplies: 0,
      wishVotesReceived: 0,
      commentsWith10Likes: 0,
      articlesWith10Likes: 0,
    },
    manualEarned: {},
    articles: [],
  }
}

export function normalizeState(raw: unknown): AppState {
  const base = defaultState()
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Partial<AppState>
  return {
    ...base,
    ...r,
    version: 1,
    community: { ...base.community, ...(r.community ?? {}) },
    daily: r.daily ?? {},
    quick: r.quick ?? {},
    manualEarned: r.manualEarned ?? {},
    articles: Array.isArray(r.articles) ? r.articles : [],
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? normalizeState(JSON.parse(raw)) : defaultState()
  } catch {
    return defaultState()
  }
}

export function usePersistentState() {
  const [state, setState] = useState<AppState>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return [state, setState] as const
}
