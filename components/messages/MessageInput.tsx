'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
  sending: boolean
  placeholder?: string
  disabled?: boolean
  disabledReason?: string
}

export default function MessageInput({
  onSend,
  sending,
  placeholder = 'Votre message…',
  disabled = false,
  disabledReason,
}: MessageInputProps) {
  const [content, setContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!disabled) textareaRef.current?.focus()
  }, [disabled])

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim()
    if (!trimmed || sending || disabled) return
    await onSend(trimmed)
    setContent('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.focus()
    }
  }, [content, sending, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  if (disabled && disabledReason) {
    return (
      <div className="p-4 border-t border-slate-100 bg-white">
        <p className="text-center text-xs text-slate-400 font-body py-2">
          {disabledReason}
        </p>
      </div>
    )
  }

  return (
    <div className="p-3 border-t border-slate-100 bg-white shrink-0">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            adjustHeight()
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={sending || disabled}
          rows={1}
          className="flex-1 input-field resize-none overflow-hidden min-h-[40px] max-h-[120px] disabled:opacity-50"
          style={{ height: 'auto' }}
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || sending || disabled}
          className="btn-primary shrink-0 h-10 w-10 p-0 flex items-center justify-center disabled:opacity-40"
          title="Envoyer (Entrée)"
        >
          {sending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
      <p className="text-[10px] text-slate-300 mt-1 font-body select-none">
        Entrée pour envoyer · Shift+Entrée pour un saut de ligne
      </p>
    </div>
  )
}