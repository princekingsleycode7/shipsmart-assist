import { createFileRoute } from "@tanstack/react-router";
import { TemplatePage } from "@/components/template-page";

export const Route = createFileRoute("/contact")({
  component: () => <TemplatePage page="contact" />,
  head: () => ({ meta: [{ title: "Contact — Delflow Logistics" }] }),
});
