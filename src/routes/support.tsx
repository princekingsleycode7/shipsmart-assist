import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listThreads, createThread } from "@/lib/chat.functions";
import { useAuth } from "@/hooks/use-auth";
import { Plus, MessageSquare } from "lucide-react";
import { TemplateShell } from "@/components/template-page";

export const Route = createFileRoute("/support")({
  component: () => <TemplateShell><Support /></TemplateShell>,
  head: () => ({ meta: [{ title: "Support — Safefreight Way" }] }),
});

function Support() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const { data: threads } = useQuery({
    queryKey: ["threads", user?.id],
    queryFn: () => list(),
    enabled: !!user,
  });

  const newThread = async () => {
    const t = await create();
    nav({ to: "/support/$threadId", params: { threadId: t.id } });
  };

  if (loading) return <p className="py-10 text-center text-muted-foreground">Loading…</p>;

  // Guests: render chat directly via Outlet (support.index renders GuestChat)
  if (!user) {
    return (
      <div className="py-6">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="py-6 md:grid md:grid-cols-[260px_1fr] md:gap-6">
      <aside className="md:sticky md:top-24 md:h-[calc(100vh-7rem)]">
        <button onClick={newThread} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 font-medium text-primary-foreground">
          <Plus className="h-4 w-4" /> New chat
        </button>
        <ul className="mt-4 space-y-1 overflow-y-auto">
          {threads?.map((t) => (
            <li key={t.id}>
              <Link to="/support/$threadId" params={{ threadId: t.id }} className="flex items-center gap-2 truncate rounded-xl px-3 py-2 text-sm hover:bg-secondary" activeProps={{ className: "bg-secondary" }}>
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{t.title}</span>
              </Link>
            </li>
          ))}
          {threads && threads.length === 0 && (
            <li className="px-3 py-6 text-center text-xs text-muted-foreground">No chats yet</li>
          )}
        </ul>
      </aside>
      <section>
        <Outlet />
      </section>
    </div>
  );
}
