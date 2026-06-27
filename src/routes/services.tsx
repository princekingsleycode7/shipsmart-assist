import { createFileRoute } from "@tanstack/react-router";
import { TemplatePage } from "@/components/template-page";

export const Route = createFileRoute("/services")({
  component: () => <TemplatePage page="service" />,
  head: () => ({ meta: [{ title: "Services — Delflow Logistics" }] }),
});
