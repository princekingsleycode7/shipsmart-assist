import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ParcelInput = z.object({
  id: z.string().uuid().optional(),
  tracking_code: z.string().min(3).max(64),
  sender: z.string().min(1).max(120),
  recipient: z.string().min(1).max(120),
  origin: z.string().min(1).max(120),
  destination: z.string().min(1).max(120),
  status: z.enum([
    "pending",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
  current_location: z.string().max(160).optional().nullable(),
  eta: z.string().optional().nullable(),
  driver_name: z.string().max(120).optional().nullable(),
  driver_phone: z.string().max(40).optional().nullable(),
});

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Admin role required");
}

export const adminListParcels = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("parcels")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUpsertParcel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ParcelInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const code = data.tracking_code.trim().toUpperCase().replace(/^#/, "").replace(/\s+/g, "-");
    const payload = { ...data, tracking_code: code, eta: data.eta || null };
    const { data: row, error } = await supabaseAdmin
      .from("parcels")
      .upsert(payload, { onConflict: "tracking_code" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminAddEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        parcel_id: z.string().uuid(),
        status: z.enum([
          "pending",
          "picked_up",
          "in_transit",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ]),
        location: z.string().max(160).optional().nullable(),
        note: z.string().max(500).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error: e1 } = await supabaseAdmin
      .from("parcel_events")
      .insert({ ...data });
    if (e1) throw new Error(e1.message);
    const { error: e2 } = await supabaseAdmin
      .from("parcels")
      .update({
        status: data.status,
        current_location: data.location ?? undefined,
      })
      .eq("id", data.parcel_id);
    if (e2) throw new Error(e2.message);
    return { ok: true };
  });

export const adminDeleteParcel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("parcels").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: Boolean(data) };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      whatsapp_number: z.string().min(5).max(40),
      support_email: z.string().email().max(160),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("app_settings")
      .update({ ...data })
      .eq("id", 1);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminPromoteByEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ email: z.string().email().max(160) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    // Find user by email via auth admin API
    const { data: list, error: lErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (lErr) throw new Error(lErr.message);
    const target = list.users.find(
      (u) => u.email?.toLowerCase() === data.email.toLowerCase(),
    );
    if (!target) throw new Error("No user found with that email");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: target.id, role: "admin" }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true, email: target.email };
  });
