import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { adminAddEvent, adminDeleteParcel, adminListParcels, adminUpsertParcel } from "@/lib/admin.functions";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Parcels });

const STATUSES = ["pending", "picked_up", "in_transit", "out_for_delivery", "delivered", "cancelled"] as const;

function Parcels() {
  const qc = useQueryClient();
  const list = useServerFn(adminListParcels);
  const upsert = useServerFn(adminUpsertParcel);
  const addEv = useServerFn(adminAddEvent);
  const del = useServerFn(adminDeleteParcel);

  const { data } = useQuery({ queryKey: ["admin-parcels"], queryFn: () => list() });
  const upsertM = useMutation({
    mutationFn: (vars: Parameters<typeof upsert>[0]) => upsert(vars),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-parcels"] }); },
    onError: (e) => toast.error((e as Error).message),
  });
  const eventM = useMutation({
    mutationFn: (vars: Parameters<typeof addEv>[0]) => addEv(vars),
    onSuccess: () => { toast.success("Event added"); qc.invalidateQueries({ queryKey: ["admin-parcels"] }); },
    onError: (e) => toast.error((e as Error).message),
  });

  const [form, setForm] = useState({
    tracking_code: "", sender: "", recipient: "", origin: "", destination: "",
    status: "pending" as (typeof STATUSES)[number], current_location: "", driver_name: "", driver_phone: "", eta: "",
  });

  return (
    <div className="space-y-6">
      <div className="card-soft p-5">
        <h2 className="font-display text-xl">New / update parcel</h2>
        <p className="text-xs text-muted-foreground">Saving an existing tracking code updates it.</p>
        <form
          onSubmit={(e) => { e.preventDefault(); upsertM.mutate({ data: { ...form, eta: form.eta || null } }); }}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          {(["tracking_code", "sender", "recipient", "origin", "destination", "current_location", "driver_name", "driver_phone"] as const).map((k) => (
            <input key={k} required={["tracking_code", "sender", "recipient", "origin", "destination"].includes(k)} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} placeholder={k.replaceAll("_", " ")} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          ))}
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as (typeof STATUSES)[number] })} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="datetime-local" value={form.eta} onChange={(e) => setForm({ ...form, eta: e.target.value })} className="rounded-xl border border-border bg-background px-3 py-2 text-sm" />
          <button className="md:col-span-2 rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground"><Plus className="mr-1 inline h-4 w-4" /> Save parcel</button>
        </form>
      </div>

      <div className="space-y-3">
        {data?.map((p) => (
          <div key={p.id} className="card-soft p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-display text-lg">#{p.tracking_code}</p>
                <p className="text-xs text-muted-foreground">{p.origin} → {p.destination}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="pill bg-secondary text-xs">{p.status}</span>
                <button onClick={() => del({ data: { id: p.id } }).then(() => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-parcels"] }); })} className="rounded-full bg-destructive/10 p-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                eventM.mutate({ data: { parcel_id: p.id, status: fd.get("status") as (typeof STATUSES)[number], location: (fd.get("location") as string) || null, note: (fd.get("note") as string) || null } });
                (e.currentTarget as HTMLFormElement).reset();
              }}
              className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <select name="status" defaultValue={p.status} className="rounded-xl border border-border bg-background px-2 py-1.5 text-xs">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input name="location" placeholder="location" className="rounded-xl border border-border bg-background px-2 py-1.5 text-xs" />
              <input name="note" placeholder="note" className="rounded-xl border border-border bg-background px-2 py-1.5 text-xs" />
              <button className="rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground">Add event</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
