import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { lookupParcel } from "@/lib/parcels.functions";
import mapIso from "@/assets/map-iso.png";
import parcelBox from "@/assets/parcel-box.png";
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Package,
  MoreVertical,
  ChevronsRight,
  ChevronDown,
} from "lucide-react";

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

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function splitCode(code: string) {
  // "ER-454-152-47N" → prefix "ER", rest "454-152-47N"
  const [prefix, ...rest] = code.split("-");
  return { prefix, rest: rest.join("-") };
}

function Detail() {
  const { id } = Route.useParams();
  const fn = useServerFn(lookupParcel);
  const [showTimeline, setShowTimeline] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["parcel", id],
    queryFn: () => fn({ data: { trackingCode: id } }),
  });

  return (
    <div className="mx-auto max-w-md py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/track"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-display text-xl">Smart Tracking</h1>
        <button
          className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary"
          aria-label="More"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {isLoading && <p className="mt-10 text-center text-muted-foreground">Loading…</p>}

      {!isLoading && !data?.parcel && (
        <div className="card-soft mt-10 p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 font-display text-2xl">No parcel found</h2>
          <p className="text-sm text-muted-foreground">
            We couldn't find <span className="font-medium">{id}</span>. Double-check the code.
          </p>
          <Link to="/track" className="mt-4 inline-block pill bg-primary text-primary-foreground">
            Try again
          </Link>
        </div>
      )}

      {data?.parcel && (
        <div className="mt-5 space-y-4 pb-28">
          {/* Map card */}
          <div className="card-soft relative overflow-hidden">
            <img
              src={mapIso}
              alt="Route map"
              className="h-52 w-full object-cover"
              loading="lazy"
            />
            <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-4 ring-background/60">
              <MapPin className="h-5 w-5" />
            </span>
          </div>

          {/* Driver card */}
          <div className="card-soft p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary font-medium">
                  {initials(data.parcel.driver_name)}
                </div>
                <div>
                  <p className="font-medium">
                    {data.parcel.driver_name ?? "Unassigned"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ID: {data.parcel.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-primary-foreground">
                {STATUS_LABEL[data.parcel.status] ?? data.parcel.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href={data.parcel.driver_phone ? `tel:${data.parcel.driver_phone}` : undefined}
                aria-disabled={!data.parcel.driver_phone}
                className={`flex items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm ${
                  data.parcel.driver_phone ? "" : "opacity-50 pointer-events-none"
                }`}
              >
                <Phone className="h-4 w-4" /> Call
              </a>
              <a
                href={data.parcel.driver_phone ? `sms:${data.parcel.driver_phone}` : undefined}
                aria-disabled={!data.parcel.driver_phone}
                className={`flex items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm ${
                  data.parcel.driver_phone ? "" : "opacity-50 pointer-events-none"
                }`}
              >
                <MessageCircle className="h-4 w-4" /> Message
              </a>
            </div>
          </div>

          {/* Trip card */}
          <div className="card-soft p-5">
            <div className="grid grid-cols-2 gap-y-5 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">From</p>
                <p className="mt-1 font-medium">{data.parcel.origin}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">To</p>
                <p className="mt-1 font-medium">{data.parcel.destination}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Customer</p>
                <p className="mt-1 font-medium">{data.parcel.recipient}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Date</p>
                <p className="mt-1 font-medium">{formatDate(data.parcel.eta ?? data.parcel.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Tracking code block */}
          <div className="card-soft relative overflow-hidden p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-3xl leading-none">
                  #{splitCode(data.parcel.tracking_code).prefix}
                </p>
                <p className="font-display text-3xl leading-tight">
                  {splitCode(data.parcel.tracking_code).rest}
                </p>
              </div>
              <img
                src={parcelBox}
                alt=""
                width={96}
                height={96}
                loading="lazy"
                className="h-24 w-24 shrink-0 object-contain"
              />
            </div>
          </div>

          {/* Timeline (collapsible) */}
          <div className="card-soft p-5">
            <button
              onClick={() => setShowTimeline((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <h3 className="font-display text-xl">Timeline</h3>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform ${
                  showTimeline ? "rotate-180" : ""
                }`}
              />
            </button>
            {showTimeline && (
              <ol className="mt-4 space-y-4">
                {data.events.map((ev) => (
                  <li key={ev.id} className="flex gap-3">
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {STATUS_LABEL[ev.status] ?? ev.status} — {ev.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ev.occurred_at).toLocaleString()}
                      </p>
                      {ev.note && (
                        <p className="mt-1 text-sm text-muted-foreground">{ev.note}</p>
                      )}
                    </div>
                  </li>
                ))}
                {data.events.length === 0 && (
                  <p className="text-sm text-muted-foreground">No events yet.</p>
                )}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* Sticky bottom CTA */}
      {data?.parcel && (
        <div className="fixed inset-x-0 bottom-20 z-30 px-4 md:bottom-6">
          <div className="mx-auto flex max-w-md items-center justify-between rounded-full border border-border bg-card p-2 pr-5 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Package className="h-5 w-5" />
              </span>
              <span className="font-medium">Go Track</span>
            </div>
            <Link
              to="/track"
              className="flex items-center gap-1 text-muted-foreground"
              aria-label="New tracking"
            >
              <ChevronsRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
