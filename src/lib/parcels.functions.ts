import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const normalize = (code: string) =>
  code.trim().toUpperCase().replace(/^#/, "").replace(/\s+/g, "-");

export const lookupParcel = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ trackingCode: z.string().min(3).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const code = normalize(data.trackingCode);
    const { data: parcel, error } = await supabaseAdmin
      .from("parcels")
      .select(
        "id, tracking_code, sender, recipient, origin, destination, status, current_location, eta, driver_name, driver_phone, created_at",
      )
      .ilike("tracking_code", code)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!parcel) return { parcel: null, events: [] as Event[] };

    const { data: events } = await supabaseAdmin
      .from("parcel_events")
      .select("id, status, location, note, occurred_at")
      .eq("parcel_id", parcel.id)
      .order("occurred_at", { ascending: true });

    return { parcel, events: events ?? [] };
  });

export type Event = {
  id: string;
  status: string;
  location: string | null;
  note: string | null;
  occurred_at: string;
};

export const getWhatsAppNumber = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data } = await supabaseAdmin
      .from("app_settings")
      .select("whatsapp_number, support_email")
      .eq("id", 1)
      .maybeSingle();
    return data ?? { whatsapp_number: null, support_email: null };
  },
);
