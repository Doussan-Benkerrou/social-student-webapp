'use client'

import { useUnreadCount,useTotalUnreadCount } from '@/hooks/useMessages'

interface UnreadBadgeProps {
  id_discussion : number
  id_user       : number
}

export default function UnreadBadge({ id_discussion, id_user }: UnreadBadgeProps) {
  const { count } = useUnreadCount(id_discussion, id_user)

  if (!count) return null

  return (
    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
      {count > 9 ? '9+' : count}
    </span>
  )
}

export function TotalUnreadBadge(id_user:number) {
  const { total } = useTotalUnreadCount(id_user)

  if(!total) return null

  return (
    <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
      {total > 99 ? '99+' : total}
    </span>
  )
}
