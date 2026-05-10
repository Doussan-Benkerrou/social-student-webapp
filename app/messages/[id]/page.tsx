'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import ChatHeader from '@/components/messages/ChatHeader'
import MessageBubble from '@/components/messages/MessageBubble'
import DateSeparator from '@/components/messages/DateSeparator'
import MessageInput from '@/components/messages/MessageInput'
import EmptyState from '@/components/messages/EmptyState'
import { useMessages, useSendMessage, useDeleteMessage } from '@/hooks/useMessages'
import { useDiscussion } from '@/hooks/useDiscussion'
import useUser from '@/hooks/useUser'
import { Loader2, ChevronDown } from 'lucide-react'
import { useBlockList } from '@/hooks/useBlockList'
import type { ResponseType , Message } from '@/lib/types'

function groupByDay(messages: Message[]): { day: string; items: Message[] }[] {
  return messages.reduce<{ day: string; items: Message[] }[]>((acc, msg) => {
    const day = new Date(msg.date_message).toDateString()
    const last = acc[acc.length - 1]
    if (last && last.day === day) { last.items.push(msg) }
    else { acc.push({ day, items: [msg] }) }
    return acc
  }, [])
}

export default function ChatPage() {
  const { id } = useParams()
  const router = useRouter()
  const id_discussion = Number(id)

  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showScroll, setShowScroll] = useState(false)

  const { user, loading: userLoading } = useUser()
  const currentUserId = user?.id_utilisateur ?? null

  const curUser: ResponseType | undefined = user
    ? { success: true, data: user }
    : undefined

  const { discussion, loading: discussionLoading } = useDiscussion(id_discussion)
  const { messages, loading: messagesLoading, hasMore, loadMore } = useMessages(
    id_discussion,
    currentUserId ?? 0
  )
  const { send, sending } = useSendMessage()
  const { remove } = useDeleteMessage()


  const { isDiscussionBlocked, getBlockMessage } = useBlockList()
  const isBlocked = isDiscussionBlocked(discussion)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setShowScroll(el.scrollHeight - el.scrollTop - el.clientHeight > 200)
  }

  const handleSend = useCallback(async (content: string) => {
    if (!currentUserId) return
    await send(content, id_discussion, currentUserId)
  }, [send, id_discussion, currentUserId])

  const handleDelete = useCallback(async (id_message: number) => {
    if (!currentUserId) return
    await remove(id_message, currentUserId)
  }, [remove, currentUserId])

  const grouped = groupByDay(messages)

  if (userLoading || discussionLoading || !discussion) {
    return (
      <AppLayout curUser={curUser}>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-blue-300" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout curUser={curUser}>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <ChatHeader
          discussion={discussion}
          currentUserId={currentUserId!}
          onBack={() => router.back()}
        />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scrollbar-thin bg-slate-50 relative"
        >
          <div ref={bottomRef} />

          {messagesLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={22} className="animate-spin text-blue-300" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState title="Aucun message" description="Envoyez le premier message !" />
          ) : (
            <div className="flex flex-col-reverse">
              {grouped.map((group) => (
                <div key={group.day}>
                  <DateSeparator dateStr={group.items[0].date_message} />
                  <div className="space-y-2 flex flex-col-reverse">
                    {group.items.map((msg) => (
                      <MessageBubble
                        key={msg.id_message}
                        message={msg}
                        isOwn={currentUserId !== null && Number(msg.id_sender) === currentUserId}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="flex justify-center mb-2">
                  <button
                    onClick={loadMore}
                    className="px-4 py-3 text-xs text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    ↑ Charger les messages précédents
                  </button>
                </div>
              )}
            </div>
          )}

          {showScroll && (
            <button
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="sticky bottom-4 left-1/2 transform -translate-x-1/2 btn-icon shadow-md border border-slate-200 bg-white z-10"
            >
              <ChevronDown size={16} />
            </button>
          )}
        </div>

        {isBlocked ? (
          <div className="p-4 border-t border-slate-100 bg-white">
            <p className="text-center text-xs text-slate-400 font-body py-2">
              {getBlockMessage(discussion)}
            </p>
          </div>
        ) : (
          <MessageInput onSend={handleSend} sending={sending} />
        )}
      </div>
    </AppLayout>
  )
}