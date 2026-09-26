import {
  Award,
  BookOpen,
  Camera,
  Crown,
  Eye,
  Heart,
  Lightbulb,
  MessageCircle,
  MessagesSquare,
  PenLine,
  Sparkles,
  ThumbsUp,
  UserRound,
  Vote,
  Newspaper,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react'
import { createElement } from 'react'

/** Icons keyed by badge id prefix or mission icon key. */
const ICONS: Record<string, LucideIcon> = {
  'knowledge-seeker': BookOpen,
  'hello-world': UserRound,
  'photo-finisher': Camera,
  'discussion-debut': MessageCircle,
  'first-wish': Sparkles,
  'first-article': PenLine,
  visit: Eye,
  like: Heart,
  comment: MessageCircle,
  vote: Vote,
  publish: PenLine,
  'wish-vote': Vote,
  article: Newspaper,
  'conversation-starter': MessagesSquare,
  'idea-influencer': Lightbulb,
  'meaningful-contributor': ThumbsUp,
  'valued-creator': Crown,
}

function iconFor(key: string): LucideIcon {
  return ICONS[key] ?? ICONS[key.replace(/-\d+w?$/, '')] ?? Award
}

export function BadgeIcon({ name, ...props }: { name: string } & LucideProps) {
  return createElement(iconFor(name), props)
}
