import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Truck, Plane, Ship } from "lucide-react";

type Slide = {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  image: string;
  icon: React.ReactNode;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Worldwide freight",
    title: (
      <>
        We Are Global<br />
        <span className="italic font-light">Logistic Provider</span>
      </>
    ),
    body: "Air, ocean and road freight orchestrated end-to-end — with real-time tracking on every parcel.",
    image: "/assets/slider-1.jpg",
    icon: <Plane className="h-4 w-4" strokeWidth={1.75} />,
  },
  {
    eyebrow: "Door to door",
    title: (
      <>
        We Are Global<br />
        <span className="italic font-light">Logistic Provider</span>
      </>
    ),
    body: "From first mile to last mile, your shipment stays visible, accountable and on schedule.",
    image: "/assets/slider-1-2.jpg",
    icon: <Truck className="h-4 w-4" strokeWidth={1.75} />,
  },
  {
    eyebrow: "Ocean & rail",
    title: (
      <>
        We Are Global<br />
        <span className="italic font-light">Logistic Provider</span>
      </>
    ),
    body: "Trusted cross-border networks, transparent paperwork, dependable delivery windows.",
    image: "/assets/slider-1.jpg",
    icon: <Ship className="h-4 w-4" strokeWidth={1.75} />,
  },
];

export function HeroCarousel() {
  const [i, setI] = useState(0);
  const next = useCallback(() => setI((v) => (v + 1) % SLIDES.length), []);
  const prev = () => setI((v) => (v - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    const id = setInterval(next, 6500);
    return () => clearInterval(id);
  }, [next]);

  const slide = SLIDES[i];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#0b0f1a] text-white"
      style={{ minHeight: "min(100dvh, 760px)" }}
      aria-label="Delflow Logistics hero"
    >
      {/* Background slides */}
      {SLIDES.map((s, idx) => (
        <div
          key={idx}
          aria-hidden={idx !== i}
          className="absolute inset-0 transition-opacity duration-[1200ms] ease-out"
          style={{ opacity: idx === i ? 1 : 0 }}
        >
          <img
            src={s.image}
            alt=""
            className="h-full w-full object-cover"
            style={{ transform: idx === i ? "scale(1.06)" : "scale(1)", transition: "transform 7s ease-out" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
        </div>
      ))}

      {/* Content */}
      <div className="relative mx-auto flex max-w-[1400px] flex-col justify-center px-5 sm:px-8 lg:px-12" style={{ minHeight: "min(100dvh, 760px)" }}>
        <div className="grid grid-cols-1 items-center gap-10 py-24 sm:py-28 lg:grid-cols-[minmax(0,1fr)_auto] lg:py-32">
          <div className="max-w-[640px]">
            <div
              key={i}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/85 backdrop-blur-md"
              style={{ animation: "lov-fade-up .7s ease both" }}
            >
              {slide.icon}
              <span>{slide.eyebrow}</span>
            </div>

            <h1
              key={`h-${i}`}
              className="mt-6 text-[clamp(2.5rem,7vw,5.25rem)] font-semibold leading-[1.05] tracking-[-0.02em]"
              style={{ animation: "lov-fade-up .8s .05s ease both" }}
            >
              {slide.title}
            </h1>

            <p
              key={`p-${i}`}
              className="mt-5 max-w-[52ch] text-base leading-relaxed text-white/75 sm:text-lg"
              style={{ animation: "lov-fade-up .8s .12s ease both" }}
            >
              {slide.body}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/tracking"
                className="group inline-flex items-center gap-2 rounded-full bg-[#f5b82e] px-6 py-3.5 text-sm font-medium text-[#0b0f1a] transition active:translate-y-[1px] hover:bg-[#ffc847]"
              >
                Track a parcel
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/10 active:translate-y-[1px]"
              >
                Our Services
              </Link>
            </div>
          </div>

          {/* Right rail: dot/index meta — hidden on mobile to keep hero in viewport */}
          <div className="hidden lg:flex flex-col items-end gap-6 text-right">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
              {String(i + 1).padStart(2, "0")} <span className="mx-2 text-white/25">/</span> {String(SLIDES.length).padStart(2, "0")}
            </div>
            <div className="h-px w-24 bg-white/20" />
            <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-white/55">
              Delflow Logistics
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4 pb-8 sm:pb-12">
          <div className="flex items-center gap-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="group h-1.5 overflow-hidden rounded-full bg-white/15"
                style={{ width: idx === i ? 44 : 18, transition: "width .4s ease" }}
              >
                <span
                  className="block h-full bg-white"
                  style={{
                    width: idx === i ? "100%" : "0%",
                    transition: idx === i ? "width 6.3s linear" : "none",
                  }}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition hover:bg-white/10 active:translate-y-[1px]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition hover:bg-white/10 active:translate-y-[1px]"
            >
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes lov-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="lov-fade-up"] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
