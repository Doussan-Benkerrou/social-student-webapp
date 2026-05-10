'use client'

import { MessageCircle } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
}

export default function EmptyState({
  title = 'Aucune discussion',
  description = 'Sélectionnez une discussion pour commencer à chatter',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 gap-3">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto">
        <MessageCircle size={24} className="text-slate-300" />
      </div>
      <p className="font-display font-semibold text-slate-700">{title}</p>
      <p className="text-sm text-slate-400 font-body mt-1">{description}</p>
    </div>
  )
}
