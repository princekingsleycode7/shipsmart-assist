import { createFileRoute } from "@tanstack/react-router";
import { TemplatePage } from "@/components/template-page";

export const Route = createFileRoute("/tracking")({
  component: () => <TemplatePage page="track-search" />,
  head: () => ({ meta: [{ title: "Track Shipment — Safefreight Way" }] }),
});
