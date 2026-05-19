import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/use-auth";
import { createThread } from "@/lib/chat.functions";
import { Send, Sparkles, Wrench, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/support/")({ component: SupportIndex });

function SupportIndex() {
  const { user } = useAuth();
  const nav = useNavigate();
  const create = useServerFn(createThread);

  if (user) {
    return (
      <div className="card-soft flex min-h-[60vh] flex-col items-center justify-center p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-display text-3xl">Delvora Assistant</h2>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Pick a saved chat from the sidebar, or start a new one.
        </p>
        <button
          onClick={async () => {
            const t = await create();
            nav({ to: "/support/$threadId", params: { threadId: t.id } });
          }}
          className="mt-5 rounded-full bg-primary px-5 py-2.5 font-medium text-primary-foreground"
        >
          New chat
        </button>
      </div>
    );
  }

  return <GuestChat />;
}

function GuestChat() {
  const nav = useNavigate();
  const create = useServerFn(createThread);
  const transport = new DefaultChatTransport({ api: "/api/chat" });
  const { messages, sendMessage, status } = useChat({
    id: "guest",
    messages: [] as UIMessage[],
    transport,
  });

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || status !== "ready") return;
    setInput("");
    await sendMessage({ text });
  };

  const saveChat = () => {
    // GuestChat only renders when not authed; route to login.
    toast.info("Sign in to save this chat");
    nav({ to: "/login" });
  };

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[calc(100vh-11rem)] flex-col">
      <div className="mb-3 flex items-center justify-between rounded-2xl border border-dashed border-border bg-card/50 px-4 py-2.5 text-xs">
        <span className="text-muted-foreground">
          Chatting as guest. <Link to="/login" className="underline">Sign in</Link> to save chat history.
        </span>
        {messages.length > 0 && (
          <button
            onClick={saveChat}
            disabled={saving}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            <Save className="h-3 w-3" /> {saving ? "Saving…" : "Save chat"}
          </button>
        )}
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-1 pb-4 pt-2">
        {messages.length === 0 && (
          <div className="card-soft flex flex-col items-center p-8 text-center">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="mt-2 font-display text-2xl">How can I help?</h2>
            <p className="text-sm text-muted-foreground">Try "Where is ER-454-152-47N?"</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className={m.role === "user" ? "max-w-[80%] rounded-3xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground" : "max-w-[88%]"}>
              {m.parts.map((p, i) => {
                if (p.type === "text") {
                  return (
                    <div key={i} className="prose prose-sm max-w-none text-current prose-p:my-2 prose-pre:bg-secondary">
                      <ReactMarkdown>{p.text}</ReactMarkdown>
                    </div>
                  );
                }
                if (p.type.startsWith("tool-")) {
                  const tp = p as unknown as { type: string; state?: string; input?: unknown; output?: unknown };
                  return (
                    <details key={i} className="my-2 rounded-2xl border border-border bg-card px-3 py-2 text-xs">
                      <summary className="flex cursor-pointer items-center gap-2 font-medium">
                        <Wrench className="h-3.5 w-3.5" />
                        <span>{tp.type.replace("tool-", "")}</span>
                        <span className="text-muted-foreground">· {tp.state ?? "running"}</span>
                      </summary>
                      <pre className="mt-2 overflow-auto text-[11px] text-muted-foreground">{JSON.stringify({ input: tp.input, output: tp.output }, null, 2)}</pre>
                    </details>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
        {status === "submitted" && <p className="text-sm text-muted-foreground">Thinking…</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={onSubmit} className="card-soft flex items-end gap-2 p-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
          placeholder="Ask about a parcel or shipping…"
          rows={1}
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 outline-none"
        />
        <button type="submit" disabled={busy || !input.trim()} className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
