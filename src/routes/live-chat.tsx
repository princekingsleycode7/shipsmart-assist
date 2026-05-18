import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { getOrCreateConversation, listConversationMessages, sendSupportMessage } from "@/lib/support.functions";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

export const Route = createFileRoute("/live-chat")({ component: LiveChat });

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
  const { data: messages } = useQuery({
    queryKey: ["live-msgs", conversation?.id],
    queryFn: () => list({ data: { conversationId: conversation!.id } }),
    enabled: !!conversation?.id,
  });

  useEffect(() => {
    if (!conversation?.id) return;
    const ch = supabase
      .channel(`support:${conversation.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `conversation_id=eq.${conversation.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["live-msgs", conversation.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [conversation?.id, qc]);

  const [body, setBody] = useState("");
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (loading) return <p className="py-10 text-center text-muted-foreground">Loading…</p>;
  if (!user) return (
    <div className="py-10"><h1 className="font-display text-4xl">Sign in to chat</h1><Link to="/login" className="mt-4 inline-block pill bg-primary text-primary-foreground">Sign in</Link></div>
  );

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (!text || !conversation?.id) return;
    setBody("");
    await send({ data: { conversationId: conversation.id, body: text } });
    qc.invalidateQueries({ queryKey: ["live-msgs", conversation.id] });
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col py-4">
      <h1 className="font-display text-2xl">Live agent chat</h1>
      <p className="text-sm text-muted-foreground">An agent will reply as soon as possible.</p>
      <div className="mt-4 flex-1 space-y-3 overflow-y-auto py-2">
        {messages?.map((m) => (
          <div key={m.id} className={m.sender_id === user.id ? "flex justify-end" : ""}>
            <div className={m.sender_id === user.id ? "max-w-[80%] rounded-3xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground" : "max-w-[80%] rounded-3xl rounded-bl-sm bg-secondary px-4 py-2"}>
              {m.body}
            </div>
          </div>
        ))}
        {messages && messages.length === 0 && <p className="text-sm text-muted-foreground">Say hi to start the conversation.</p>}
        <div ref={bottom} />
      </div>
      <form onSubmit={onSend} className="card-soft flex items-end gap-2 p-2">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={1} placeholder="Type a message…" className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 outline-none" />
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
