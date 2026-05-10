'use client'

import { ArrowLeft, MoreVertical, Hash, Trash2 } from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import {
  getDiscussionDisplayName,
  getDiscussionInitials,
} from '@/services/discussionService'
import { getDiscussionPhoto } from '@/lib/utils'
import { Discussion } from '@/lib/types'

interface ChatHeaderProps {
  discussion    : Discussion
  currentUserId : number
  onBack?       : () => void
  onOptions?    : () => void
  onClick?      : () => void
  onDelete?     : () => void
}

export default function ChatHeader({
  discussion,
  currentUserId,
  onBack,
  onOptions,
  onDelete
}: ChatHeaderProps) {

  const isGroup = discussion.id_groupe !== null
  const name    = getDiscussionDisplayName(discussion, currentUserId)
  const initials = getDiscussionInitials(discussion, currentUserId)
  const photo    = getDiscussionPhoto(discussion, currentUserId);

  return (
    <div className="px-5 py-4 bg-white border-b border-slate-100 flex items-center gap-3 shadow-sm shrink-0">
      {onBack && (
        <button onClick={onBack} className="btn-icon">
          <ArrowLeft size={16} />
        </button>
      )}

      <Avatar
        initials={initials}
        src={photo}
        size="sm"
        color={isGroup ? 'from-violet-400 to-violet-700' : 'from-brand-400 to-brand-700'}
      />

      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-900 truncate">
          {name}
        </p>
        <p className="text-[11px] text-slate-400 flex items-center gap-1">
          {isGroup
            ? <><Hash size={9} /> Discussion de groupe</>
            : null
          }
        </p>
      </div>

      {onOptions && (
        <button onClick={onOptions} className="btn-icon">
          <MoreVertical size={16} />
        </button>
      )}

      {onDelete && (
        <button 
        onClick={onDelete}
        title='Supprimer la discussion'>
          <Trash2 size={18} />
        </button>
      )}
    </div>
  )
}