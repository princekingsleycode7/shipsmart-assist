import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { lookupParcel } from "@/lib/parcels.functions";
import mapIso from "@/assets/map-iso.png";
import { ArrowLeft, MapPin, Phone, MessageCircle, Package } from "lucide-react";

export const Route = createFileRoute("/track/$id")({
  component: Detail,
  head: ({ params }) => ({ meta: [{ title: `Tracking ${params.id} — Delvora` }] }),
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
    <div className="py-6">
      <div className="flex items-center justify-between">
        <Link to="/track" className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"><ArrowLeft className="h-4 w-4" /></Link>
        <h1 className="font-display text-xl">Smart Tracking</h1>
        <div className="h-10 w-10" />
      </div>

      {isLoading && <p className="mt-10 text-center text-muted-foreground">Loading…</p>}

      {!isLoading && !data?.parcel && (
        <div className="card-soft mt-10 p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 font-display text-2xl">No parcel found</h2>
          <p className="text-sm text-muted-foreground">We couldn't find <span className="font-medium">{id}</span>. Double-check the code.</p>
          <Link to="/track" className="mt-4 inline-block pill bg-primary text-primary-foreground">Try again</Link>
        </div>
      )}

      {data?.parcel && (
        <div className="mt-6 space-y-4">
          <div className="card-soft overflow-hidden">
            <img src={mapIso} alt="Route map" className="h-48 w-full object-cover" loading="lazy" />
          </div>

          <div className="card-soft p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Driver</p>
                <p className="font-medium">{data.parcel.driver_name ?? "Unassigned"}</p>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                {STATUS_LABEL[data.parcel.status] ?? data.parcel.status}
              </span>
            </div>
            {data.parcel.driver_phone && (
              <div className="mt-4 flex gap-2">
                <a href={`tel:${data.parcel.driver_phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-2 text-sm">
                  <Phone className="h-4 w-4" /> Call
                </a>
                <a href={`sms:${data.parcel.driver_phone}`} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-2 text-sm">
                  <MessageCircle className="h-4 w-4" /> Message
                </a>
              </div>
            )}
          </div>

          <div className="card-soft p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase text-muted-foreground">From</p>
                <p className="font-medium">{data.parcel.origin}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">To</p>
                <p className="font-medium">{data.parcel.destination}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Sender</p>
                <p className="font-medium">{data.parcel.sender}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Recipient</p>
                <p className="font-medium">{data.parcel.recipient}</p>
              </div>
              {data.parcel.eta && (
                <div className="col-span-2">
                  <p className="text-xs uppercase text-muted-foreground">ETA</p>
                  <p className="font-medium">{new Date(data.parcel.eta).toLocaleString()}</p>
                </div>
              )}
            </div>
            <p className="mt-4 font-display text-3xl">#{data.parcel.tracking_code}</p>
          </div>

          <div className="card-soft p-5">
            <h3 className="font-display text-xl">Timeline</h3>
            <ol className="mt-4 space-y-4">
              {data.events.map((ev) => (
                <li key={ev.id} className="flex gap-3">
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{STATUS_LABEL[ev.status] ?? ev.status} — {ev.location}</p>
                    <p className="text-xs text-muted-foreground">{new Date(ev.occurred_at).toLocaleString()}</p>
                    {ev.note && <p className="mt-1 text-sm text-muted-foreground">{ev.note}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
