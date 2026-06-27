import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, Sparkles, Phone, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/track", label: "Track", icon: Search },
  { to: "/support", label: "Support", icon: Sparkles },
  { to: "/contact", label: "Contact", icon: Phone },
];

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const loc = useLocation();
  const full = isAdmin ? [...items, { to: "/admin", label: "Admin", icon: Shield }] : items;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {full.map((it) => {
          const active = loc.pathname === it.to || (it.to !== "/" && loc.pathname.startsWith(it.to));
          const Icon = it.icon;
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[11px] transition-colors",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    active ? "bg-primary text-primary-foreground shadow-md" : "bg-transparent",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className={active ? "text-foreground" : ""}>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TopNav({ isAdmin, isAuthed, onLogout }: { isAdmin: boolean; isAuthed: boolean; onLogout: () => void }) {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border bg-background/80 backdrop-blur md:block">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="font-display text-2xl">Delflow</span>
        </Link>
        <nav className="flex items-center gap-1">
          {items.map((it) => (
            <Link key={it.to} to={it.to} className="pill text-sm hover:bg-secondary">
              {it.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="pill text-sm hover:bg-secondary">
              Admin
            </Link>
          )}
          {isAuthed ? (
            <button onClick={onLogout} className="pill bg-secondary text-sm hover:bg-secondary/80">
              Sign out
            </button>
          ) : (
            <Link to="/login" className="pill bg-primary text-sm text-primary-foreground hover:opacity-90">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <path d="M5 7h11l3 4v6h-2.2a2.8 2.8 0 0 1-5.6 0H9.8a2.8 2.8 0 0 1-5.6 0H3V8a1 1 0 0 1 1-1h1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="7" cy="17" r="1.6" fill="currentColor" />
        <circle cx="16" cy="17" r="1.6" fill="currentColor" />
      </svg>
    </span>
  );
}
