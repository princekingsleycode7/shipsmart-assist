import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Package, Sparkles, Shield } from "lucide-react";
import heroTruck from "@/assets/hero-truck.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Delvora — Quick, safe, reliable delivery" },
      { name: "description", content: "Track your parcels in real time and chat with Delvora support whenever you need help." },
    ],
  }),
});

function Index() {
  return (
    <div className="pt-6 md:pt-10">
      <section className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
        <div className="order-2 md:order-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Trusted logistics, on demand
          </span>
          <h1 className="mt-4 font-display text-5xl leading-[1.05] md:text-7xl">
            <em className="not-italic">Quick, Safe,</em>
            <br />
            <em>And Reliable</em>
            <br />
            Delivery
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Receive your packages quickly, safely, and without any hassle. Track every step or get
            instant answers from our assistant.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/track"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-medium text-primary-foreground shadow-md transition hover:opacity-90"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15">
                <Package className="h-4 w-4" />
              </span>
              Start tracking
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/support" className="pill bg-secondary hover:bg-secondary/80">
              Ask the assistant
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 text-center">
            {[
              { k: "12k+", v: "Parcels delivered" },
              { k: "4.9", v: "Avg rating" },
              { k: "24/7", v: "AI support" },
            ].map((s) => (
              <div key={s.v} className="card-soft px-2 py-4">
                <div className="font-display text-3xl">{s.k}</div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative mx-auto aspect-square w-full max-w-sm">
            <img
              src={heroTruck}
              alt="Delvora delivery truck illustration"
              className="h-full w-full object-contain drop-shadow-xl"
              width={1024}
              height={1024}
            />
            <span className="absolute left-2 top-6 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs shadow">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> ETA 4h
            </span>
            <span className="absolute bottom-8 right-2 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs shadow">
              <Shield className="h-3.5 w-3.5 text-primary" /> Insured
            </span>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-4 md:grid-cols-3">
        {[
          { icon: Package, t: "Live tracking", d: "Follow your parcel from pickup to doorstep with a clear timeline." },
          { icon: Sparkles, t: "AI assistant", d: "Get instant answers about your shipment, 24/7, in plain English." },
          { icon: Shield, t: "Talk to a human", d: "Reach a real agent on WhatsApp or chat with our team in-app." },
        ].map((f) => (
          <div key={f.t} className="card-soft p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-2xl">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="mt-16">
        <div className="card-soft flex flex-col items-center gap-4 p-8 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="font-display text-3xl">Got a tracking number?</h2>
            <p className="text-sm text-muted-foreground">Try one of our demo codes: ER-454-152-47N or DL-882-001-12A</p>
          </div>
          <Link to="/track" className="pill bg-primary text-primary-foreground">Track now</Link>
        </div>
      </section>
    </div>
  );
}
