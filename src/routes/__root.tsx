import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { BottomNav, TopNav } from "@/components/nav";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { checkIsAdmin } from "@/lib/admin.functions";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <p className="mt-2 text-muted-foreground">This page wandered off the delivery route.</p>
        <Link to="/" className="mt-6 inline-block pill bg-primary text-primary-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card-soft max-w-md p-8 text-center">
        <h1 className="font-display text-2xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="pill bg-primary text-primary-foreground"
          >
            Try again
          </button>
          <Link to="/" className="pill bg-secondary">Home</Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Delvora — Quick, safe, reliable delivery" },
      { name: "description", content: "Track parcels in real time, chat with our AI support assistant, or talk to a real agent on WhatsApp." },
      { property: "og:title", content: "Delvora — Quick, safe, reliable delivery" },
      { property: "og:description", content: "Track parcels in real time, chat with our AI support assistant, or talk to a real agent on WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Delvora — Quick, safe, reliable delivery" },
      { name: "twitter:description", content: "Track parcels in real time, chat with our AI support assistant, or talk to a real agent on WhatsApp." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e1905aec-1d9c-46d4-8e96-48dc73f29950" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/e1905aec-1d9c-46d4-8e96-48dc73f29950" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}

function Shell() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();
  const adminFn = useServerFn(checkIsAdmin);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, qc]);

  const { data: adminData } = useQuery({
    queryKey: ["isAdmin", user?.id],
    queryFn: () => adminFn(),
    enabled: !!user,
  });
  const isAdmin = Boolean(adminData?.isAdmin);

  const onLogout = async () => {
    await supabase.auth.signOut();
    router.navigate({ to: "/" });
  };

  // Marketing template provides its own chrome; backend pages use TemplateShell.
  void isAdmin; void loading; void user; void onLogout;
  return <Outlet />;
}
