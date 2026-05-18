import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { adminListConversations, listConversationMessages, sendSupportMessage } from "@/lib/support.functions";
import { supabase } from "@/integrations/supabase/client";
import { Send } from "lucide-react";

export const Route = createFileRoute("/admin/chats")({ component: AdminChats });

function AdminChats() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const list = useServerFn(adminListConversations);
  const msgs = useServerFn(listConversationMessages);
  const send = useServerFn(sendSupportMessage);

  const { data: convs } = useQuery({ queryKey: ["admin-convs"], queryFn: () => list() });
  const [active, setActive] = useState<string | null>(null);
  const { data: messages } = useQuery({
    queryKey: ["admin-msgs", active],
    queryFn: () => msgs({ data: { conversationId: active! } }),
    enabled: !!active,
  });

  useEffect(() => {
    if (!active) return;
    const ch = supabase
      .channel(`admin-support:${active}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "support_messages", filter: `conversation_id=eq.${active}` }, () => {
        qc.invalidateQueries({ queryKey: ["admin-msgs", active] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active, qc]);

  const [body, setBody] = useState("");
  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !body.trim()) return;
    await send({ data: { conversationId: active, body: body.trim() } });
    setBody("");
    qc.invalidateQueries({ queryKey: ["admin-msgs", active] });
  };

  return (
    <div className="grid h-[70vh] gap-4 md:grid-cols-[260px_1fr]">
      <aside className="card-soft overflow-y-auto p-2">
        {convs?.map((c) => (
          <button key={c.id} onClick={() => setActive(c.id)} className={`block w-full rounded-xl px-3 py-2 text-left text-sm ${active === c.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
            <p className="truncate font-medium">{c.subject ?? "Support"}</p>
            <p className="truncate text-xs opacity-70">{new Date(c.updated_at).toLocaleString()}</p>
          </button>
        ))}
        {convs && convs.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">No conversations</p>}
      </aside>
      <section className="card-soft flex flex-col p-3">
        {!active && <p className="m-auto text-sm text-muted-foreground">Select a conversation</p>}
        {active && (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto p-2">
              {messages?.map((m) => (
                <div key={m.id} className={m.sender_id === user?.id ? "flex justify-end" : ""}>
                  <div className={m.sender_id === user?.id ? "max-w-[80%] rounded-3xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground" : "max-w-[80%] rounded-3xl rounded-bl-sm bg-secondary px-4 py-2"}>{m.body}</div>
                </div>
              ))}
            </div>
            <form onSubmit={onSend} className="flex items-end gap-2 border-t border-border pt-2">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={1} placeholder="Reply…" className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 outline-none" />
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"><Send className="h-4 w-4" /></button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
