import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import {
  convertToModelMessages,
  streamText,
  tool,
  stepCountIs,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const SYSTEM_PROMPT = `You are Delflow Assistant, a friendly customer-support agent for the Delflow delivery service.

You help customers with:
- tracking parcels (use the lookupParcel tool whenever the user provides a tracking code)
- explaining delivery statuses (pending, picked up, in transit, out for delivery, delivered)
- estimated delivery times and shipping policies
- escalating to a human agent (mention they can tap "Talk to a human" in the Contact tab)

Be warm, concise, and use markdown for lists. Never invent parcel data — always use the tool.`;

type Body = { messages?: unknown; threadId?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { messages, threadId } = (await request.json()) as Body;
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        // Optional auth — read bearer if present so we can persist
        let userId: string | null = null;
        const auth = request.headers.get("authorization");
        if (auth?.startsWith("Bearer ")) {
          const token = auth.slice(7);
          const { data } = await supabaseAdmin.auth.getUser(token);
          userId = data.user?.id ?? null;
        }

        const provider = createLovableAiGatewayProvider(key);
        const model = provider("google/gemini-3-flash-preview");

        const tools = {
          lookupParcel: tool({
            description:
              "Look up a parcel by its tracking code. Returns current status, route, ETA, and timeline events.",
            inputSchema: z.object({
              trackingCode: z
                .string()
                .min(3)
                .max(64)
                .describe("Tracking code, e.g. ER-454-152-47N"),
            }),
            execute: async ({ trackingCode }) => {
              const code = trackingCode
                .trim()
                .toUpperCase()
                .replace(/^#/, "")
                .replace(/\s+/g, "-");
              const { data: parcel } = await supabaseAdmin
                .from("parcels")
                .select(
                  "tracking_code, sender, recipient, origin, destination, status, current_location, eta, driver_name",
                )
                .ilike("tracking_code", code)
                .maybeSingle();
              if (!parcel) return { found: false, trackingCode: code };
              const { data: parcelRow } = await supabaseAdmin
                .from("parcels")
                .select("id")
                .ilike("tracking_code", code)
                .maybeSingle();
              const { data: events } = await supabaseAdmin
                .from("parcel_events")
                .select("status, location, note, occurred_at")
                .eq("parcel_id", parcelRow?.id ?? "")
                .order("occurred_at", { ascending: true });
              return { found: true, parcel, events: events ?? [] };
            },
          }),
        };

        const uiMessages = messages as UIMessage[];

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(uiMessages),
          tools,
          stopWhen: stepCountIs(50),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          onFinish: async ({ messages: finalMessages }) => {
            if (!userId || !threadId) return;
            // Verify thread belongs to user
            const { data: thread } = await supabaseAdmin
              .from("chat_threads")
              .select("id, title, user_id")
              .eq("id", threadId)
              .maybeSingle();
            if (!thread || thread.user_id !== userId) return;

            // Replace messages for this thread
            await supabaseAdmin.from("chat_messages").delete().eq("thread_id", threadId);
            const rows = finalMessages.map((m) => ({
              thread_id: threadId,
              role: m.role,
              parts: m.parts as unknown as never,
            }));
            if (rows.length) await supabaseAdmin.from("chat_messages").insert(rows);

            // Auto-title from first user message
            if (thread.title === "New chat") {
              const firstUser = finalMessages.find((m) => m.role === "user");
              const text = firstUser?.parts
                ?.map((p) => (p.type === "text" ? (p as { text: string }).text : ""))
                .join(" ")
                .slice(0, 60);
              if (text) {
                await supabaseAdmin
                  .from("chat_threads")
                  .update({ title: text })
                  .eq("id", threadId);
              }
            }
            await supabaseAdmin
              .from("chat_threads")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", threadId);
          },
        });
      },
    },
  },
});
