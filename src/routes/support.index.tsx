import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/support/")({
  component: () => (
    <div className="card-soft flex min-h-[60vh] flex-col items-center justify-center p-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Sparkles className="h-6 w-6" /></span>
      <h2 className="mt-4 font-display text-3xl">Delvora Assistant</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">Start a new chat to ask about your parcels, shipping, or anything else.</p>
    </div>
  ),
});
