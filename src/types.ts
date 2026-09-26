export type DailyMetric = 'visit' | 'like' | 'comment'
export type WeeklyMetric = 'vote' | 'publish'
export type ActivityMetric = DailyMetric | WeeklyMetric

export type CommunityMetric =
  | 'commentsWithReplies'
  | 'wishVotesReceived'
  | 'commentsWith10Likes'
  | 'articlesWith10Likes'

export type DayBoundary = 'local' | 'utc'

export type DayLog = Partial<Record<ActivityMetric, boolean>>

export type ArticleStatus = 'idea' | 'drafting' | 'published'

export interface Article {
  id: string
  title: string
  status: ArticleStatus
  url?: string
  publishedOn?: string
  likes: number
}

export interface AppState {
  version: 1
  onboarded: boolean
  startDate: string | null
  dayBoundary: DayBoundary
  reminderTime: string
  daily: Record<string, DayLog>
  quick: Record<string, boolean>
  /** Day each quick win was ticked, so it stays visible as "done" in today's missions. */
  quickOn: Record<string, string>
  community: Record<CommunityMetric, number>
  manualEarned: Record<string, boolean>
  articles: Article[]
}

export type BadgeKind = 'quick' | 'streak' | 'weekly' | 'community'

interface BadgeBase {
  id: string
  num: number
  name: string
  phase: 1 | 2 | 3 | 4 | 5 | 6
  requirement: string
  tip: string
}

export type Badge =
  | (BadgeBase & { kind: 'quick'; autoFrom?: ActivityMetric })
  | (BadgeBase & { kind: 'streak'; metric: DailyMetric; target: number })
  | (BadgeBase & { kind: 'weekly'; metric: WeeklyMetric; target: number })
  | (BadgeBase & { kind: 'community'; metric: CommunityMetric; target: number })

export interface BadgeProgress {
  badge: Badge
  current: number
  target: number
  earned: boolean
  /** Earliest date (YYYY-MM-DD) the badge can be earned if nothing is missed; null when it depends on other people. */
  eta: string | null
}
