'use client'
import {parseDate} from "@/lib/utils"


function formatDateLabel(dateStr: string | Date): string {
  const date = parseDate(dateStr)
  if (!date) return ''
  const today     = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString())     return "Aujourd'hui"
  if (date.toDateString() === yesterday.toDateString()) return 'Hier'

  return date.toLocaleDateString('fr-FR', {
    weekday : 'long',
    day     : 'numeric',
    month   : 'long',
  })
}


interface DateSeparatorProps {
  dateStr: string | Date
}

export default function DateSeparator({ dateStr }: DateSeparatorProps) {
  const label = formatDateLabel(dateStr)
  if (!label) return null

  return (
    <div className="flex items-center gap-3 my-4 px-2">
      <div className="flex-1 h-px bg-slate-100" />
      <span className="text-[11px] text-slate-500 font-semibold px-1">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  )
}