import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getThread } from "@/lib/chat.functions";
import { supabase } from "@/integrations/supabase/client";
import { Send, Sparkles, Wrench } from "lucide-react";

export const Route = createFileRoute("/support/$threadId")({
  component: Thread,
});

function Thread() {
  const { threadId } = Route.useParams();
  const fn = useServerFn(getThread);
  const { data, isLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => fn({ data: { threadId } }),
  });

  if (isLoading) return <p className="py-10 text-center text-muted-foreground">Loading…</p>;
  if (!data) return null;
  return <ChatWindow threadId={threadId} initial={data.messages as unknown as UIMessage[]} />;
}

function ChatWindow({ threadId, initial }: { threadId: string; initial: UIMessage[] }) {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: async ({ messages, body }) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers: Record<string, string> = {};
          if (token) headers.Authorization = `Bearer ${token}`;
          return {
            body: { messages, threadId, ...(body ?? {}) },
            headers,
          };
        },
      }),
    [threadId],
  );

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initial,
    transport,
  });

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId, status === "ready"]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || status !== "ready") return;
    setInput("");
    await sendMessage({ text });
  };

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
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
        {status === "submitted" && (
          <p className="text-sm text-muted-foreground">Thinking…</p>
        )}
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
