'use client'

import { useState, useMemo, useCallback, useRef, useEffect, Suspense } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import DiscussionRow from '@/components/messages/DiscussionRow'
import EmptyState from '@/components/messages/EmptyState'
import ChatHeader from '@/components/messages/ChatHeader'
import MessageBubble from '@/components/messages/MessageBubble'
import DateSeparator from '@/components/messages/DateSeparator'
import MessageInput from '@/components/messages/MessageInput'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDiscussionsByUser, useDiscussion, useDeleteDiscussion } from '@/hooks/useDiscussion'
import { useMessages, useSendMessage, useDeleteMessage } from '@/hooks/useMessages'
import useUser from '@/hooks/useUser'
import { getDiscussionDisplayName } from '@/services/discussionService'
import { Search, Loader2, Lock, Users, ChevronDown } from 'lucide-react'
import type { ResponseType, Message } from '@/lib/types'
import { useBlockList } from '@/hooks/useBlockList'

type Tab = 'private' | 'groups'

function normalizeDate(dateStr: string | Date): Date | null {
    if (!dateStr) return null
    if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? null : dateStr
    const d = new Date(dateStr.toString().replace(' ', 'T').replace(/\+00:00$/, 'Z'))
    return isNaN(d.getTime()) ? null : d
}

function groupByDay(messages: Message[]): { day: string; items: Message[] }[] {
    return messages.reduce<{ day: string; items: Message[] }[]>((acc, msg) => {
        const date = normalizeDate(msg.date_message)
        const day = date ? date.toDateString() : 'Invalid Date'
        const last = acc[acc.length - 1]
        if (last && last.day === day) { last.items.push(msg) }
        else { acc.push({ day, items: [msg] }) }
        return acc
    }, [])
}

function InlineChatPanel({
    id_discussion,
    currentUserId,
    onClose,
}: {
    id_discussion: number;
    currentUserId: number;
    onExpand: () => void;
    onClose: () => void
}) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [showScroll, setShowScroll] = useState(false)
    const isAtBottomRef = useRef(true)
    const prevScrollHeightRef = useRef(0)
    const initialScrollDone = useRef(false)

    const { discussion, loading: discLoading } = useDiscussion(id_discussion)
    const { messages, setMessages, loading: msgLoading, hasMore, loadMore } = useMessages(id_discussion, currentUserId)
    const { send, sending } = useSendMessage()
    const { remove } = useDeleteMessage(setMessages)
    const { removeDis } = useDeleteDiscussion()

    const { isDiscussionBlocked, getBlockMessage } = useBlockList()
    const isBlocked = isDiscussionBlocked(discussion)

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        const el = scrollRef.current
        if (!el) return
        el.scrollTop = el.scrollHeight
    }, [])

    useEffect(() => {
        if (!msgLoading && !initialScrollDone.current) {
            initialScrollDone.current = true
            requestAnimationFrame(() => scrollToBottom('auto'))
        }
    }, [msgLoading, scrollToBottom])

    const prevLengthRef = useRef(messages.length)
    useEffect(() => {
        const added = messages.length - prevLengthRef.current
        prevLengthRef.current = messages.length
        if (added === 1 && isAtBottomRef.current) {
            scrollToBottom('smooth')
        }
    }, [messages.length, scrollToBottom])

    useEffect(() => {
        const el = scrollRef.current
        if (!el || prevScrollHeightRef.current === 0) return
        el.scrollTop = el.scrollHeight - prevScrollHeightRef.current
        prevScrollHeightRef.current = 0
    })

    const handleScroll = useCallback(() => {
        const el = scrollRef.current
        if (!el) return
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
        isAtBottomRef.current = distFromBottom < 120
        setShowScroll(distFromBottom > 200)
    }, [])

    const handleLoadMore = useCallback(() => {
        const el = scrollRef.current
        if (el) prevScrollHeightRef.current = el.scrollHeight
        loadMore()
    }, [loadMore])

    const handleSend = useCallback(async (content: string) => {
        await send(content, id_discussion, currentUserId)
        requestAnimationFrame(() => scrollToBottom('smooth'))
    }, [send, id_discussion, currentUserId, scrollToBottom])

    const handleDeleteMessage = useCallback(async (id_message: number) => {
        await remove(id_message, currentUserId)
    }, [remove, currentUserId])

    const handleDeleteDiscussion = useCallback(async () => {
        if (discussion?.id_groupe !== null) {
            for (const msg of messages) await remove(msg.id_message, currentUserId)
            onClose(); return
        }
        await removeDis(id_discussion, currentUserId)
        onClose()
    }, [removeDis, discussion, messages, remove, id_discussion, currentUserId, onClose])

    const grouped = groupByDay(messages)

    if (discLoading || !discussion) {
        return <div className="flex-1 flex items-center justify-center"><Loader2 size={22} className="animate-spin text-blue-300" /></div>
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center border-b border-slate-100 bg-white shrink-0">
                <div className="flex-1 min-w-0">
                    <ChatHeader discussion={discussion} currentUserId={currentUserId} onBack={onClose} onDelete={handleDeleteDiscussion} />
                </div>
            </div>

            <div ref={scrollRef} onScroll={handleScroll}
                className="flex-1 overflow-y-auto scrollbar-thin p-4 bg-slate-50 flex flex-col">

                {hasMore && (
                    <div className="flex justify-center mb-3 shrink-0">
                        <button onClick={handleLoadMore} className="px-3 py-1.5 text-xs text-slate-400 hover:text-blue-600 transition-colors">
                            ↑ Messages précédents
                        </button>
                    </div>
                )}

                {msgLoading && messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-blue-300" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <EmptyState title="Aucun message" description="Envoyez le premier message !" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-1 mt-auto">
                        {grouped.map((group) => (
                            <div key={group.day} className="flex flex-col gap-1">
                                <DateSeparator dateStr={group.items[0].date_message} />
                                <div className="flex flex-col gap-1.5">
                                    {group.items.map((msg) => (
                                        <MessageBubble
                                            key={msg.id_message}
                                            message={msg}
                                            isOwn={Number(msg.id_sender) === currentUserId}
                                            onDelete={handleDeleteMessage}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showScroll && (
                    <button onClick={() => scrollToBottom('smooth')}
                        className="sticky bottom-4 self-center btn-icon shadow-md border border-slate-200 bg-white z-10">
                        <ChevronDown size={14} />
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
    )
}

// Composant interne qui utilise useSearchParams — doit être dans Suspense
function MessagesContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const discussionParam = searchParams.get('discussion')
    const groupeParam = searchParams.get('groupe')
    const tabParam = searchParams.get('tab')

    const [activeTab, setActiveTab] = useState<Tab>(tabParam === 'groups' ? 'groups' : 'private')
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const { user, loading: userLoading } = useUser()
    const currentUserId = user?.id_utilisateur ?? null
    const curUser: ResponseType | undefined = user ? { success: true, data: user } : undefined

    const { discussions, loading: discussionsLoading } = useDiscussionsByUser(currentUserId ?? 0)

    useEffect(() => {
        if (discussionsLoading) return

        if (discussionParam) {
            const id = Number(discussionParam)
            if (!isNaN(id) && id > 0) {
                const target = discussions.find(d => d.id_discussion === id)
                if (target) setActiveTab(target.id_groupe !== null ? 'groups' : 'private')
                setSelectedId(id)
            }
            return
        }

        if (groupeParam) {
            const target = discussions.find(d => d.id_groupe === Number(groupeParam))
            if (target) { setActiveTab('groups'); setSelectedId(target.id_discussion) }
        }
    }, [discussionParam, groupeParam, discussions, discussionsLoading])

    const filtered = useMemo(() => {
        if (!search.trim() || !currentUserId) return discussions
        const q = search.toLowerCase()
        return discussions.filter((d) => {
            const displayName = getDiscussionDisplayName(d, currentUserId).toLowerCase()
            if (displayName.includes(q)) return true
            const last = (d.messages ?? []).at(-1)
            return last?.content?.toLowerCase().includes(q) ?? false
        })
    }, [discussions, search, currentUserId])

    if (userLoading || currentUserId === null) {
        return (
            <AppLayout curUser={curUser}>
                <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin text-blue-300" />
                </div>
            </AppLayout>
        )
    }

    const privateDiscussions = filtered.filter(d => d.id_groupe === null)
    const groupDiscussions = filtered.filter(d => d.id_groupe !== null)

    return (
        <AppLayout curUser={curUser}>
            <div className="h-[calc(100vh-4rem)] flex">
                <div className="w-80 shrink-0 flex flex-col border-r border-slate-100 bg-white">
                    <div className="p-4 border-b border-slate-100">
                        <h1 className="font-bold text-lg text-slate-900 mb-3">Messages</h1>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nom, prénom, message…" className="input-field pl-8" />
                        </div>
                    </div>
                    <div className="flex border-b border-slate-100">
                        {(['private', 'groups'] as Tab[]).map((t) => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors ${activeTab === t ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                {t === 'private' ? <><Lock size={11} /> Privées</> : <><Users size={11} /> Groupes</>}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-thin">
                        {activeTab === 'private' && (
                            discussionsLoading
                                ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-blue-300" /></div>
                                : privateDiscussions.length === 0
                                    ? <EmptyState title="Aucune conversation privée" description="Vos discussions privées apparaîtront ici." />
                                    : <div className="py-1">{privateDiscussions.map((d) => (
                                        <button key={d.id_discussion} onClick={() => setSelectedId(d.id_discussion)}
                                            className={`w-full text-left transition-colors ${selectedId === d.id_discussion ? 'bg-brand-50 border-r-2 border-brand-500' : 'hover:bg-slate-50'}`}>
                                            <DiscussionRow discussion={d} currentUserId={currentUserId} />
                                        </button>
                                    ))}</div>
                        )}
                        {activeTab === 'groups' && (
                            discussionsLoading
                                ? <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-blue-300" /></div>
                                : groupDiscussions.length === 0
                                    ? <EmptyState title="Aucun groupe" description="Rejoignez une communauté pour voir ses discussions." />
                                    : <div className="py-1">{groupDiscussions.map((d) => (
                                        <button key={d.id_discussion} onClick={() => setSelectedId(d.id_discussion)}
                                            className={`w-full text-left transition-colors ${selectedId === d.id_discussion ? 'bg-brand-50 border-r-2 border-brand-500' : 'hover:bg-slate-50'}`}>
                                            <DiscussionRow discussion={d} currentUserId={currentUserId} />
                                        </button>
                                    ))}</div>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                    {selectedId !== null ? (
                        <InlineChatPanel
                            key={selectedId}
                            id_discussion={selectedId}
                            currentUserId={currentUserId}
                            onExpand={() => router.push(`/messages/${selectedId}`)}
                            onClose={() => setSelectedId(null)}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <EmptyState title="Sélectionnez une conversation" description="Choisissez une discussion dans la liste pour commencer." />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}

// Export par défaut : enveloppe MessagesContent dans Suspense
export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-blue-300" />
            </div>
        }>
            <MessagesContent />
        </Suspense>
    )
}