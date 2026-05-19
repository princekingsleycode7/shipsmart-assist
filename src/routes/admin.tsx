import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { checkIsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const fn = useServerFn(checkIsAdmin);
  const { data, isLoading } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: () => fn(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading || isLoading) return <p className="py-10 text-center text-muted-foreground">Loading…</p>;
  if (user && data && !data.isAdmin) {
    return (
      <div className="py-10 text-center">
        <h1 className="font-display text-3xl">Admin only</h1>
        <p className="text-sm text-muted-foreground">Your account isn't an admin yet. Ask the system owner to grant access.</p>
        <Link to="/" className="mt-4 inline-block pill bg-secondary">Go home</Link>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Admin</h1>
        <nav className="flex flex-wrap gap-1">
          <Link to="/admin" className="pill bg-secondary text-sm" activeOptions={{ exact: true }} activeProps={{ className: "pill bg-primary text-primary-foreground text-sm" }}>Parcels</Link>
          <Link to="/admin/chats" className="pill bg-secondary text-sm" activeProps={{ className: "pill bg-primary text-primary-foreground text-sm" }}>Live chats</Link>
          <Link to="/admin/users" className="pill bg-secondary text-sm" activeProps={{ className: "pill bg-primary text-primary-foreground text-sm" }}>Users</Link>
        </nav>
      </div>
      <div className="mt-6"><Outlet /></div>
    </div>
  );
}
