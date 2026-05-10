'use client'

import { ChevronRight, Hash, Lock } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import UnreadBadge from './UnreadBadge'
import {getDiscussionInitials, getDiscussionDisplayName} from '@/services/discussionService'
import {Discussion} from "@/lib/types"
import {getDiscussionPhoto,formatTime} from "@/lib/utils"



interface DiscussionRowProps {
  discussion    : Discussion
  currentUserId?: number
}




export default function DiscussionRow({
  discussion,
  currentUserId = 0,
}: DiscussionRowProps) {

  const isGroup  = discussion.id_groupe !== null
  const label    = getDiscussionDisplayName(discussion, currentUserId)
  const initials = getDiscussionInitials(discussion, currentUserId)
  const photo    = getDiscussionPhoto(discussion, currentUserId)
  const color    = isGroup
    ? 'from-violet-400 to-violet-700'
    : 'from-brand-400 to-brand-700'

  const messages    = discussion.messages ?? (discussion as any).message ?? []
  const lastMessage = messages[messages.length - 1] ?? null

  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 transition-colors text-left group">
      <Avatar initials={initials} src={photo} size="md" color={color} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-bold text-sm text-slate-900 truncate">{label}</p>
            {isGroup && (
              <span className="chip bg-violet-100 text-violet-700 text-[10px] shrink-0">
                Groupe
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 shrink-0 ml-2">
            {formatTime(lastMessage?.date_message)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-400 truncate flex items-center gap-1">
            {isGroup
              ? <Hash size={10} className="shrink-0" />
              : <Lock size={10} className="shrink-0" />
            }
            {lastMessage?.content ?? 'Aucun message'}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            <UnreadBadge
              id_discussion={discussion.id_discussion}
              id_user={currentUserId}
            />
            <ChevronRight
              size={13}
              className="text-slate-200 group-hover:text-brand-400 transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  )
}