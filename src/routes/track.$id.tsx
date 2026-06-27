import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { lookupParcel } from "@/lib/parcels.functions";
import { TemplateShell } from "@/components/template-page";

export const Route = createFileRoute("/track/$id")({
  component: Detail,
  head: ({ params }) => ({ meta: [{ title: `Tracking ${params.id} — Delflow Logistics` }] }),
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  picked_up: "Picked up",
  in_transit: "In transit",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function Detail() {
  const { id } = Route.useParams();
  const fn = useServerFn(lookupParcel);
  const { data, isLoading } = useQuery({
    queryKey: ["parcel", id],
    queryFn: () => fn({ data: { trackingCode: id } }),
  });

  return (
    <TemplateShell>
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 12px 32px rgba(15,23,42,.06)" }}>
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h2 style={{ fontWeight: 700, margin: 0 }}>Shipment <span style={{ color: "#f5a623" }}>#{id}</span></h2>
              <Link to="/tracking" className="btn btn-sm" style={{ background: "#0c2340", color: "#fff", borderRadius: 999, padding: "8px 18px" }}>
                <i className="fas fa-search" /> New search
              </Link>
            </div>

            {isLoading && <p className="text-center text-muted py-5">Loading…</p>}

            {!isLoading && !data?.parcel && (
              <div className="text-center py-5">
                <i className="fas fa-box-open" style={{ fontSize: 48, color: "#cbd5e1" }} />
                <h4 className="mt-3">No parcel found</h4>
                <p className="text-muted">We couldn't find <strong>{id}</strong>. Double-check your code.</p>
              </div>
            )}

            {data?.parcel && (
              <>
                <div className="row" style={{ rowGap: 16 }}>
                  <Info label="Status" value={<span style={{ background: "#0c2340", color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: 12 }}>{STATUS_LABEL[data.parcel.status] ?? data.parcel.status}</span>} />
                  <Info label="Current location" value={data.parcel.current_location ?? "—"} />
                  <Info label="From" value={data.parcel.origin} />
                  <Info label="To" value={data.parcel.destination} />
                  <Info label="Sender" value={data.parcel.sender} />
                  <Info label="Recipient" value={data.parcel.recipient} />
                  <Info label="Driver" value={data.parcel.driver_name ?? "—"} />
                  <Info label="Driver phone" value={data.parcel.driver_phone ?? "—"} />
                  <Info label="ETA" value={data.parcel.eta ? new Date(data.parcel.eta).toLocaleString() : "—"} />
                </div>

                <hr style={{ margin: "32px 0" }} />
                <h4 style={{ fontWeight: 700, marginBottom: 18 }}><i className="fas fa-route" style={{ color: "#f5a623", marginRight: 8 }} />Timeline</h4>
                {data.events.length === 0 && <p className="text-muted">No events yet.</p>}
                <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {data.events.map((ev) => (
                    <li key={ev.id} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ width: 36, height: 36, borderRadius: "50%", background: "#0c2340", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className="fas fa-map-marker-alt" />
                      </span>
                      <div>
                        <strong>{STATUS_LABEL[ev.status] ?? ev.status}</strong> — {ev.location ?? ""}
                        <div style={{ fontSize: 12, color: "#64748b" }}>{new Date(ev.occurred_at).toLocaleString()}</div>
                        {ev.note && <div style={{ fontSize: 14, color: "#475569", marginTop: 4 }}>{ev.note}</div>}
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
      </div>
    </TemplateShell>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="col-md-4 col-sm-6">
      <div style={{ fontSize: 11, textTransform: "uppercase", color: "#94a3b8", letterSpacing: 1 }}>{label}</div>
      <div style={{ fontWeight: 600, marginTop: 4 }}>{value}</div>
    </div>
  );
}
