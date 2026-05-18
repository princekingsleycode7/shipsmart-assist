import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getWhatsAppNumber } from "@/lib/parcels.functions";
import { MessageCircle, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [{ title: "Contact — Delvora" }, { name: "description", content: "Talk to a real Delvora agent on WhatsApp or in-app chat." }] }),
});

function Contact() {
  const fn = useServerFn(getWhatsAppNumber);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => fn() });
  const phone = data?.whatsapp_number ?? "";
  const waUrl = phone ? `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi Delvora, I need help with my parcel.")}` : "#";

  return (
    <div className="py-10">
      <h1 className="font-display text-4xl md:text-6xl"><em>Talk</em> to a human</h1>
      <p className="mt-2 text-muted-foreground">We're here whenever you need us.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <a href={waUrl} target="_blank" rel="noreferrer" className="card-soft block p-6 transition hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] text-white"><MessageCircle className="h-6 w-6" /></div>
          <h2 className="mt-4 font-display text-2xl">WhatsApp</h2>
          <p className="text-sm text-muted-foreground">Chat with an agent on WhatsApp — usually replies in minutes.</p>
          {phone && <p className="mt-3 text-sm font-medium">+{phone.replace(/[^0-9]/g, "")}</p>}
        </a>

        <Link to="/live-chat" className="card-soft block p-6 transition hover:-translate-y-0.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground"><Phone className="h-6 w-6" /></div>
          <h2 className="mt-4 font-display text-2xl">In-app live chat</h2>
          <p className="text-sm text-muted-foreground">Start a conversation with our support team right inside the app.</p>
        </Link>
      </div>

      {data?.support_email && (
        <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" /> Or email us at <a className="underline" href={`mailto:${data.support_email}`}>{data.support_email}</a>
        </p>
      )}
    </div>
  );
}
