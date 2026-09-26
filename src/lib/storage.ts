import { useEffect, useState } from 'react'
import type { AppState } from '../types'

const STORAGE_KEY = 'aws-badge-tracker:v1'

export function defaultState(): AppState {
  return {
    version: 1,
    onboarded: false,
    startDate: null,
    dayBoundary: 'local',
    reminderTime: '20:00',
    daily: {},
    quick: {},
    quickOn: {},
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
  const hasData = !!r.startDate || Object.keys(r.daily ?? {}).length > 0
  return {
    ...base,
    ...r,
    version: 1,
    onboarded: r.onboarded ?? hasData,
    community: { ...base.community, ...(r.community ?? {}) },
    daily: r.daily ?? {},
    quick: r.quick ?? {},
    quickOn: r.quickOn ?? {},
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
