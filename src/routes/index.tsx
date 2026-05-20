import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  Headphones,
  MapPin,
  Package,
  Plane,
  Search,
  Shield,
  Ship,
  Truck,
  Wifi,
} from "lucide-react";
import heroTruck from "@/assets/hero-truck.png";
import mapIso from "@/assets/map-iso.png";
import parcelBox from "@/assets/parcel-box.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Delvora — Quick, safe, reliable delivery worldwide" },
      {
        name: "description",
        content:
          "Delvora moves your parcels worldwide with live tracking, an AI assistant, and a logistics network you can trust.",
      },
    ],
  }),
});

const PARTNERS = ["NORTHWIND", "DT GLOBAL", "NAYBA", "MOVE", "WINSUPPLY", "FERGUSON"];

const SERVICES = [
  { icon: Ship, title: "Sea freight", note: "Container & LCL across major ports." },
  { icon: Plane, title: "Air freight", note: "Express lanes for time-critical cargo." },
  { icon: Truck, title: "Road delivery", note: "Last-mile in every major metro." },
];

const FEATURES = [
  { icon: Wifi, label: "Nationwide carrier network" },
  { icon: Shield, label: "Fully-featured logistics software" },
  { icon: Headphones, label: "Exception tracing & live support" },
];

function Index() {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [dest, setDest] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="pt-6 md:pt-10">
      {/* ============== HERO ============== */}
      <section className="relative">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-display text-5xl leading-[1.02] md:text-7xl">
            Delivering Your Parcels
            <br />
            <span className="inline-flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary md:h-12 md:w-12">
                <Globe className="h-5 w-5 md:h-6 md:w-6" />
              </span>
              <em className="text-primary">Worldwide</em>
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Real-time tracking, an always-on assistant, and a network built for parcels that
            simply have to arrive.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/track" });
            }}
            className="mx-auto mt-7 flex max-w-2xl flex-col items-stretch gap-2 rounded-2xl bg-card p-2 shadow-md sm:flex-row"
          >
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter pickup location"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <input
                value={dest}
                onChange={(e) => setDest(e.target.value)}
                placeholder="Enter destination"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl bg-foreground px-4 py-3 text-background transition hover:opacity-90"
              aria-label="Search routes"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div className="relative mx-auto mt-10 aspect-[16/10] w-full max-w-3xl">
          <img
            src={heroTruck}
            alt="Delvora delivery truck illustration"
            className="h-full w-full object-contain drop-shadow-xl"
          />
          <span className="absolute left-4 top-6 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs shadow">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> ETA 4h
          </span>
          <span className="absolute bottom-6 right-4 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs shadow">
            <Shield className="h-3.5 w-3.5 text-primary" /> Insured
          </span>
          <span className="absolute left-6 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow md:inline-flex">
            360°
          </span>
        </div>
      </section>

      {/* ============== TRUST STRIP ============== */}
      <section className="mt-12">
        <div className="rounded-3xl bg-foreground px-6 py-6 text-background">
          <div className="grid grid-cols-2 items-center gap-y-4 text-center text-sm tracking-widest text-background/70 sm:grid-cols-3 md:grid-cols-6">
            {PARTNERS.map((p) => (
              <span key={p} className="font-display text-base">
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============== #1 NATIONWIDE ============== */}
      <section className="mt-16 grid items-center gap-10 md:grid-cols-2">
        <div className="relative">
          <div className="card-soft overflow-hidden p-0">
            <img src={mapIso} alt="Network map" className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="card-soft absolute -bottom-8 -right-4 hidden w-44 p-3 sm:block">
            <img src={parcelBox} alt="Parcel" className="h-24 w-full object-contain" />
            <div className="mt-1 text-center text-xs text-muted-foreground">645+ daily routes</div>
          </div>
        </div>
        <div>
          <h2 className="font-display text-4xl md:text-5xl">
            <span className="text-primary">#1</span> Nationwide
            <br />
            Delivery Logistics
            <br />
            Solution
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Delvora was founded to make door-to-door parcel delivery feel effortless. With a
            growing fleet and partner network across the country, we handle the heavy lift so
            your shipment arrives quickly, safely, and on schedule.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/contact" className="pill bg-primary text-primary-foreground">
              Get a quote
            </Link>
            <Link to="/support" className="pill bg-secondary hover:bg-secondary/80">
              Learn more
            </Link>
          </div>
        </div>
      </section>

      {/* ============== SERVICES ============== */}
      <section className="mt-20">
        <h2 className="text-center font-display text-4xl md:text-5xl">
          Shipping & Logistics
          <br />
          Services
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {SERVICES.map((s) => (
            <div
              key={s.title}
              className="card-soft relative overflow-hidden p-6 transition hover:-translate-y-0.5"
            >
              <div className="flex h-32 items-center justify-center rounded-2xl bg-primary/15">
                <s.icon className="h-14 w-14 text-foreground/80" strokeWidth={1.25} />
              </div>
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-2xl">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.note}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============== POWERING LOGISTICS ============== */}
      <section className="mt-20 grid items-center gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-4xl md:text-5xl">
            Powering logistics
            <br />
            across business
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Delight your customers, scale operations, and boost margins with our advanced
            logistics platform — built to supercharge your supply chain.
          </p>
          <ul className="mt-6 space-y-3">
            {FEATURES.map((f) => (
              <li
                key={f.label}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-foreground">
                  <f.icon className="h-4 w-4" />
                </span>
                <span className="text-sm">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-soft overflow-hidden p-0">
          <img src={mapIso} alt="Logistics platform" className="aspect-square w-full object-cover" />
        </div>
      </section>

      {/* ============== FIND LOCATIONS ============== */}
      <section className="mt-20">
        <h2 className="text-center font-display text-4xl md:text-5xl">
          Find Locations To Buy, Sell
          <br />
          Or Lease Containers
        </h2>
        <div className="relative mt-10 rounded-3xl bg-secondary p-6 md:p-10">
          <img
            src={mapIso}
            alt="World map"
            className="mx-auto h-72 w-full object-contain opacity-70 md:h-96"
          />
          <div className="card-soft absolute left-6 top-10 hidden w-56 p-3 md:block">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <div>
                <div className="text-sm font-medium">California, USA</div>
                <div className="text-xs text-muted-foreground">Demo hub · 24/7</div>
              </div>
            </div>
          </div>
          {[
            { t: "20%", l: "30%" },
            { t: "40%", l: "55%" },
            { t: "55%", l: "70%" },
            { t: "35%", l: "80%" },
          ].map((p, i) => (
            <span
              key={i}
              className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background shadow"
              style={{ top: p.t, left: p.l }}
            >
              <MapPin className="h-3.5 w-3.5" />
            </span>
          ))}
        </div>
      </section>

      {/* ============== TRACK CTA ============== */}
      <section className="mt-20">
        <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-foreground p-6 text-background md:grid-cols-2 md:p-10">
          <div>
            <h2 className="font-display text-4xl md:text-5xl">
              Track your
              <br />
              shipments
            </h2>
            <p className="mt-3 max-w-sm text-background/70">
              Enter your tracking code to see live status, route, and estimated delivery.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs">
              <Package className="h-3.5 w-3.5" /> Try ER-454-152-47N
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) navigate({ to: "/track/$id", params: { id: code.trim() } });
            }}
            className="card-soft space-y-3 bg-card p-5 text-foreground"
          >
            <div className="font-display text-xl">Quickly Track your Shipment</div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your shipment code"
              className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              defaultValue=""
              className="w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>
                Select your service
              </option>
              <option>Standard delivery</option>
              <option>Express delivery</option>
              <option>International</option>
            </select>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition hover:opacity-90"
            >
              Track now <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>

      {/* ============== FOOTER ============== */}
      <footer className="mt-20 rounded-3xl bg-card p-8 md:p-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="font-display text-2xl">Delvora</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Quick, safe, and reliable parcel delivery — anywhere your packages need to go.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/track" className="hover:text-primary">Track package</Link></li>
              <li><Link to="/support" className="hover:text-primary">AI assistant</Link></li>
              <li><Link to="/live-chat" className="hover:text-primary">Live chat</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Company
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/login" className="hover:text-primary">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Reach us
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>hello@delvora.app</li>
              <li>+1 (555) 010-2024</li>
              <li>San Francisco · 24/7 support</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border pt-5 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Delvora. All rights reserved.</div>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
