import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  getOrCreateConversation,
  listConversationMessages,
  sendSupportMessage,
} from "@/lib/support.functions";
import { supabase } from "@/integrations/supabase/client";
import { Send, ArrowLeft, Headphones, Loader2 } from "lucide-react";

export const Route = createFileRoute("/live-chat")({ component: LiveChat });

/* ─── tiny helpers ─────────────────────────────────────────────────────────── */

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateDivider(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

/* Group consecutive messages from the same sender */
interface GroupedMessage {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  isFirst: boolean;
  isLast: boolean;
  showDivider: boolean;
  dividerLabel: string;
}

function groupMessages(messages: any[], userId: string): GroupedMessage[] {
  return messages.map((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];

    const sameDay =
      prev && new Date(prev.created_at).toDateString() === new Date(m.created_at).toDateString();

    return {
      ...m,
      isFirst: !prev || prev.sender_id !== m.sender_id || !sameDay,
      isLast: !next || next.sender_id !== m.sender_id,
      showDivider: !sameDay || !prev,
      dividerLabel: formatDateDivider(m.created_at),
    };
  });
}

/* ─── unauthenticated screen ────────────────────────────────────────────────── */
function SignInPrompt() {
  return (
    <div
      className="fixed inset-0 flex min-h-[100dvh] flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(135deg, #0F172A 0%, #1a2744 100%)" }}
    >
      <div className="w-full max-w-sm text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-orange-500/20 bg-white/5 backdrop-blur-sm">
          <Headphones className="h-9 w-9 text-orange-400" />
        </div>

        <h1
          className="mb-2 text-3xl font-bold tracking-tight text-white"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Live Support
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-400">
          Sign in to connect with a real agent. Your conversation history is
          saved and synced across all your devices.
        </p>

        <Link
          to="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-400 hover:shadow-orange-500/40 active:scale-95"
        >
          Sign in to continue
        </Link>

        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────────────────── */
function LiveChat() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const conv = useServerFn(getOrCreateConversation);
  const list = useServerFn(listConversationMessages);
  const send = useServerFn(sendSupportMessage);

  const { data: conversation } = useQuery({
    queryKey: ["live-conv", user?.id],
    queryFn: () => conv(),
    enabled: !!user,
  });

  const { data: rawMessages } = useQuery({
    queryKey: ["live-msgs", conversation?.id],
    queryFn: () => list({ data: { conversationId: conversation!.id } }),
    enabled: !!conversation?.id,
  });

  useEffect(() => {
    if (!conversation?.id) return;
    const ch = supabase
      .channel(`support:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        () => qc.invalidateQueries({ queryKey: ["live-msgs", conversation.id] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [conversation?.id, qc]);

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [rawMessages]);

  /* Auto-grow textarea */
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || !conversation?.id || sending) return;
    setSending(true);
    setBody("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    await send({ data: { conversationId: conversation.id, body: text } });
    qc.invalidateQueries({ queryKey: ["live-msgs", conversation.id] });
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend(e as any);
    }
  };

  /* ── early returns ── */
  if (loading) {
    return (
      <div
        className="flex min-h-[100dvh] items-center justify-center"
        style={{ background: "#0F172A" }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) return <SignInPrompt />;

  const messages = groupMessages(rawMessages ?? [], user.id);

  /* ── main layout ── */
  return (
    <div
      className="fixed inset-0 flex h-[100dvh] flex-col overflow-hidden"
      style={{ background: "#0F172A" }}
    >

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div
        className="flex-none border-b px-4 py-3 sm:px-6"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0c1424" }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          {/* Back */}
          <Link
            to="/"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          {/* Avatar + info */}
          <div className="relative flex-none">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-sm font-bold text-white shadow-lg shadow-orange-500/30">
              DV
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0c1424] bg-emerald-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold text-white"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Delflow Support
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Online · typically replies in minutes
            </p>
          </div>
        </div>
      </div>

      {/* ── MESSAGES ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-1">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/8 bg-white/4">
                <Headphones className="h-7 w-7 text-orange-400/70" />
              </div>
              <p
                className="text-lg font-semibold text-white/80"
                style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
              >
                Start the conversation
              </p>
              <p className="max-w-xs text-sm text-slate-500">
                A real agent will respond as soon as possible. We're here to
                help with your shipment, tracking, or any questions.
              </p>
            </div>
          )}

          {messages.map((m) => {
            const isUser = m.sender_id === user.id;

            return (
              <div key={m.id}>
                {/* Date divider */}
                {m.showDivider && (
                  <div className="my-6 flex items-center gap-3">
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-slate-600">
                      {m.dividerLabel}
                    </span>
                    <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
                  </div>
                )}

                {/* Bubble row */}
                <div
                  className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"} ${
                    m.isLast ? "mb-3" : "mb-0.5"
                  }`}
                >
                  {/* Agent avatar — only on last in a group */}
                  {!isUser && (
                    <div className="mb-0.5 flex-none">
                      {m.isLast ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                          DV
                        </div>
                      ) : (
                        <div className="h-7 w-7" />
                      )}
                    </div>
                  )}

                  <div className={`flex flex-col gap-0.5 ${isUser ? "items-end" : "items-start"} max-w-[75%] sm:max-w-[65%]`}>
                    <div
                      className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                        isUser
                          ? "bg-orange-500 text-white shadow-orange-500/20"
                          : "text-slate-200"
                      } ${
                        isUser
                          ? m.isFirst && m.isLast
                            ? "rounded-3xl"
                            : m.isFirst
                            ? "rounded-3xl rounded-br-lg"
                            : m.isLast
                            ? "rounded-3xl rounded-tr-lg rounded-br-lg"
                            : "rounded-3xl rounded-r-lg"
                          : m.isFirst && m.isLast
                          ? "rounded-3xl"
                          : m.isFirst
                          ? "rounded-3xl rounded-bl-lg"
                          : m.isLast
                          ? "rounded-3xl rounded-tl-lg rounded-bl-lg"
                          : "rounded-3xl rounded-l-lg"
                      }`}
                      style={
                        !isUser
                          ? { background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.06)" }
                          : undefined
                      }
                    >
                      {m.body}
                    </div>

                    {/* Timestamp — only on last bubble in group */}
                    {m.isLast && (
                      <span className="px-1 text-[10px] text-slate-600">
                        {formatTime(m.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottom} />
        </div>
      </div>

      {/* ── INPUT BAR ─────────────────────────────────────────────────────── */}
      <div
        className="flex-none border-t px-4 py-3 sm:px-6 sm:py-4"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "#0c1424" }}
      >
        <form
          onSubmit={onSend}
          className="mx-auto flex max-w-2xl items-end gap-3"
        >
          <div
            className="flex flex-1 items-end gap-2 rounded-2xl px-4 py-2.5"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <textarea
              ref={textareaRef}
              value={body}
              onChange={handleBodyChange}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Type a message… (Enter to send)"
              className="max-h-28 flex-1 resize-none bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
              style={{ lineHeight: "1.5" }}
            />
          </div>

          <button
            type="submit"
            disabled={!body.trim() || sending}
            className={`flex h-11 w-11 flex-none items-center justify-center rounded-2xl transition-all active:scale-95 ${
              body.trim() && !sending
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:bg-orange-400"
                : "bg-white/5 text-slate-600"
            }`}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>

        <p className="mx-auto mt-2 max-w-2xl text-center text-[10px] text-slate-700">
          Shift + Enter for new line · messages are end-to-end saved
        </p>
      </div>

    </div>
  );
}