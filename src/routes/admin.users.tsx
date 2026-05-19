import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { adminPromoteByEmail } from "@/lib/admin.functions";
import { ShieldPlus } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: AdminUsers });

function AdminUsers() {
  const promote = useServerFn(adminPromoteByEmail);
  const [email, setEmail] = useState("");
  const m = useMutation({
    mutationFn: (e: string) => promote({ data: { email: e } }),
    onSuccess: (r) => {
      toast.success(`${r.email} is now an admin`);
      setEmail("");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div className="card-soft max-w-lg p-6">
      <div className="flex items-center gap-2">
        <ShieldPlus className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl">Promote user to admin</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        The user must have signed up at least once. Enter their email to grant admin access.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email) m.mutate(email);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          required
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
        <button
          disabled={m.isPending}
          className="rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {m.isPending ? "…" : "Make admin"}
        </button>
      </form>
    </div>
  );
}
